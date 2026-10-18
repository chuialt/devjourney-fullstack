"""Simple JSON API. Mutating endpoints use a shared demo learner without authentication.
This is intentional for classroom prototyping and MUST be replaced before public deployment.
"""
import json
import os
import urllib.error
import urllib.request
from datetime import date
from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.text import slugify
from .models import CareerPath, Stage, ContentItem, Learner, Completion, Assignment


def parse_body(request):
    try:
        data = json.loads(request.body or b'{}')
        if not isinstance(data, dict):
            raise ValueError('Expected a JSON object')
        return data
    except (ValueError, UnicodeDecodeError):
        return None


def error(message, status=400):
    return JsonResponse({'error': message}, status=status)


def learner():
    return Learner.objects.select_related('path').filter(demo_key='alex').first()


def serialize_item(item, completed_ids):
    return {'id': item.id, 'slug': item.slug, 'title': item.title, 'summary': item.summary,
            'kind': item.kind, 'stage_id': item.stage_id, 'minutes': item.minutes,
            'xp': item.xp, 'difficulty': item.difficulty, 'icon': item.icon,
            'tags': item.tags, 'completed': item.id in completed_ids,
            'created_by_instructor': item.created_by_instructor}


def path_dict(path):
    return {'slug': path.slug, 'title': path.title, 'subtitle': path.subtitle,
            'description': path.description, 'accent': path.accent, 'icon': path.icon}


def health(request):
    return JsonResponse({'status': 'ok', 'app': 'DevJourney API'})


@require_http_methods(['GET'])
def bootstrap(request):
    student = learner()
    if not student:
        return error('Demo data not loaded. Run python manage.py seed_demo.', 503)
    requested_path = request.GET.get('path')
    path = CareerPath.objects.filter(slug=requested_path).first() if requested_path else student.path
    if not path:
        path = CareerPath.objects.first()
    stages = list(Stage.objects.filter(Q(path__isnull=True) | Q(path=path)).prefetch_related('items').order_by('position', 'id'))
    items = list(ContentItem.objects.filter(stage__in=stages).select_related('stage'))
    completed_ids = set(Completion.objects.filter(learner=student).values_list('item_id', flat=True))
    all_completions = Completion.objects.filter(learner=student).select_related('item')
    xp = sum(c.item.xp for c in all_completions)
    stage_data = []
    for stage in stages:
        stage_items = [serialize_item(i, completed_ids) for i in items if i.stage_id == stage.id]
        done = sum(i['completed'] for i in stage_items)
        stage_data.append({'id': stage.id, 'title': stage.title, 'description': stage.description,
                           'position': stage.position, 'icon': stage.icon, 'accent': stage.accent,
                           'path': stage.path.slug if stage.path else None,
                           'completed': done, 'total': len(stage_items), 'items': stage_items})
    total_completed = sum(i.id in completed_ids for i in items)
    progress = round(100 * total_completed / len(items)) if items else 0
    students = []
    for s in Learner.objects.all().select_related('path'):
        done = Completion.objects.filter(learner=s).count()
        students.append({'name': s.name, 'initials': s.initials, 'completed': done,
                         'path': s.path.title if s.path else 'Undecided',
                         'progress': min(100, round(100 * done / max(len(items), 1)))})
    active_assignments = Assignment.objects.select_related('item').all()[:10]
    return JsonResponse({
        'paths': [path_dict(p) for p in CareerPath.objects.all()],
        'learner': {'name': student.name, 'initials': student.initials, 'background': student.background,
                    'path': student.path.slug if student.path else None, 'xp': xp, 'streak': student.streak,
                    'completed': total_completed, 'total': len(items), 'progress': progress},
        'active_path': path.slug if path else None,
        'stages': stage_data,
        'items': [serialize_item(i, completed_ids) for i in items],
        'instructor': {
            'students': students,
            'assignments': [{'id': a.id, 'item': a.item.title, 'item_slug': a.item.slug,
                             'kind': a.item.kind, 'audience': a.audience,
                             'due_date': str(a.due_date) if a.due_date else None} for a in active_assignments],
            'total_students': Learner.objects.count(),
            'total_completions': Completion.objects.count(),
            'average_progress': round(sum(s['progress'] for s in students) / len(students)) if students else 0,
        },
    })


@csrf_exempt
@require_http_methods(['PATCH'])
def learner_update(request):
    body = parse_body(request)
    if body is None:
        return error('Invalid JSON')
    student = learner()
    if not student:
        return error('Demo data not loaded', 503)
    if 'background' in body:
        if body['background'] not in ('non_cs', 'cs'):
            return error('background must be non_cs or cs')
        student.background = body['background']
    if 'path' in body:
        chosen = CareerPath.objects.filter(slug=body['path']).first()
        if not chosen:
            return error('Unknown career path')
        student.path = chosen
    student.save()
    return JsonResponse({'ok': True, 'background': student.background, 'path': student.path.slug})


@require_http_methods(['GET'])
def item_detail(request, slug):
    item = get_object_or_404(ContentItem, slug=slug)
    student = learner()
    return JsonResponse({'item': serialize_item(item, set(Completion.objects.filter(learner=student).values_list('item_id', flat=True))),
                         'stage_title': item.stage.title, 'body': item.body})


@csrf_exempt
@require_http_methods(['POST'])
def complete_item(request, slug):
    item = get_object_or_404(ContentItem, slug=slug)
    student = learner()
    data = parse_body(request)
    if data is None:
        return error('Invalid JSON')
    if item.kind == 'mission':
        if item.body.get('type') == 'sprint':
            chosen = data.get('selected', [])
            if not isinstance(chosen, list) or len(chosen) != 4 or len(set(chosen)) != 4:
                return error('Select four unique tasks before submitting')
            valid_ids = {t['id'] for t in item.body.get('tasks', [])}
            if not set(chosen).issubset(valid_ids):
                return error('Invalid task selection')
            essential = {'database', 'api', 'ui', 'tests'}
            overlap = essential.intersection(chosen)
            score = round(len(overlap) * 100 / 4)
            feedback = ('Excellent! Your sprint backlog covers data, API, interface and quality assurance.'
                        if score == 100 else f'Good attempt. You covered {len(overlap)} of 4 core areas. Try balancing UI, API, database and tests.')
        else:
            answer = data.get('answer')
            options = item.body.get('options', [])
            if not isinstance(answer, int) or not 0 <= answer < len(options):
                return error('Choose an answer first')
            score = 100 if answer == item.body.get('correct', 0) else 40
            feedback = item.body.get('explanation', 'Review the lesson and try again.')
        if score < 100:
            return JsonResponse({'passed': False, 'score': score, 'feedback': feedback, 'xp_awarded': 0})
    else:
        score = 100
        feedback = 'Course completed. Your progress has been saved.'
    completion, created = Completion.objects.get_or_create(learner=student, item=item, defaults={'score': score})
    return JsonResponse({'passed': True, 'score': score, 'feedback': feedback,
                         'xp_awarded': item.xp if created else 0, 'already_completed': not created})


@csrf_exempt
@require_http_methods(['POST'])
def assignments(request):
    data = parse_body(request)
    if data is None:
        return error('Invalid JSON')
    item = ContentItem.objects.filter(slug=data.get('item_slug', '')).first()
    if not item:
        return error('Select a valid course or mission')
    audience = str(data.get('audience', 'Class A')).strip()[:120]
    if not audience:
        return error('Audience is required')
    due = data.get('due_date') or None
    if due:
        try:
            due = date.fromisoformat(due)
        except (ValueError, TypeError):
            return error('Date must be YYYY-MM-DD')
    assignment = Assignment.objects.create(item=item, audience=audience, due_date=due)
    return JsonResponse({'ok': True, 'id': assignment.pk, 'message': f'{item.title} assigned to {audience}.'}, status=201)


def generate_ai_course(topic, objectives, audience):
    """Optional real AI integration; without a key, use explicit local demo content."""
    key = os.environ.get('OPENAI_API_KEY', '').strip()
    if key:
        prompt = f'Create a short beginner-friendly micro-course on {topic}. Objectives: {objectives}. Audience: {audience}. Return ONLY a JSON object with a "summary" string and a "lessons" array of exactly 3 objects, each with "title" and "text" string fields. Each lesson text must be 2-4 useful sentences. No markdown fences.'
        payload = json.dumps({'model': os.environ.get('OPENAI_MODEL', 'gpt-4o-mini'),
                              'messages': [{'role': 'user', 'content': prompt}], 'temperature': 0.5}).encode()
        req = urllib.request.Request('https://api.openai.com/v1/chat/completions', data=payload,
              headers={'Authorization': f'Bearer {key}', 'Content-Type': 'application/json'}, method='POST')
        try:
            with urllib.request.urlopen(req, timeout=15) as result:
                raw = json.loads(result.read())
            parsed = json.loads(raw['choices'][0]['message']['content'])
            lessons = parsed.get('lessons', [])
            if len(lessons) >= 2 and all(isinstance(x.get('title'), str) and isinstance(x.get('text'), str) for x in lessons):
                return {'summary': str(parsed.get('summary', topic))[:250], 'lessons': lessons[:5]}, 'ai'
        except (ValueError, KeyError, TypeError, urllib.error.URLError, TimeoutError):
            pass
    # Clearly labelled deterministic fallback, NOT claimed to be generated by an LLM.
    return {'summary': f'An introductory, instructor-editable learning plan about {topic}.',
            'lessons': [
                {'title': f'Explore {topic}', 'text': f'Start by defining {topic} in your own words. Identify where it appears in a real software team. Learning goals: {objectives or "understand the basic concepts"}.'},
                {'title': 'Apply it in practice', 'text': f'Imagine a small product team using {topic}. Describe two everyday situations where the concept could help. Compare the trade-offs of different approaches.'},
                {'title': 'Reflect and check your understanding', 'text': f'Explain {topic} to a beginner. Write one example, one common mistake, and one question you would ask a professional about the topic.'},
            ]}, 'template'


@csrf_exempt
@require_http_methods(['POST'])
def create_course(request):
    data = parse_body(request)
    if data is None:
        return error('Invalid JSON')
    topic = str(data.get('topic', '')).strip()[:140]
    objectives = str(data.get('objectives', '')).strip()[:400]
    stage = Stage.objects.filter(id=data.get('stage_id')).first()
    if len(topic) < 3 or not stage:
        return error('Enter a topic (at least 3 characters) and choose a stage')
    body, mode = generate_ai_course(topic, objectives, str(data.get('audience', 'Beginners'))[:100])
    base_slug = slugify(topic)[:35] or 'mini-course'
    slug = base_slug
    index = 2
    while ContentItem.objects.filter(slug=slug).exists():
        slug = f'{base_slug}-{index}'
        index += 1
    item = ContentItem.objects.create(stage=stage, kind='course', slug=slug, title=topic,
              summary=body['summary'], minutes=12, xp=100, icon='sparkles', tags=['Instructor created'],
              body={'lessons': body['lessons'], 'objectives': objectives}, created_by_instructor=True)
    return JsonResponse({'ok': True, 'slug': item.slug, 'generation_mode': mode,
                         'message': 'Course drafted with AI.' if mode == 'ai' else 'Editable sample course created using offline templates. Configure OPENAI_API_KEY to enable AI generation.'}, status=201)


@csrf_exempt
@require_http_methods(['POST'])
def tutor(request):
    data = parse_body(request)
    if data is None:
        return error('Invalid JSON')
    question = str(data.get('question', '')).strip()[:800]
    context = str(data.get('context', 'software development'))[:160]
    if not question:
        return error('Enter a question')
    key = os.environ.get('OPENAI_API_KEY', '').strip()
    if key:
        payload = json.dumps({'model': os.environ.get('OPENAI_MODEL', 'gpt-4o-mini'),
              'messages': [{'role': 'system', 'content': f'You are an encouraging but concise software engineering tutor. Teach through hints and a concrete example, not only final answers. Current topic: {context}.'},
                           {'role': 'user', 'content': question}], 'temperature': 0.5}).encode()
        req = urllib.request.Request('https://api.openai.com/v1/chat/completions', data=payload,
              headers={'Authorization': f'Bearer {key}', 'Content-Type': 'application/json'}, method='POST')
        try:
            with urllib.request.urlopen(req, timeout=15) as result:
                raw = json.loads(result.read())
            return JsonResponse({'answer': raw['choices'][0]['message']['content'], 'mode': 'ai'})
        except (KeyError, ValueError, urllib.error.URLError, TimeoutError):
            pass
    return JsonResponse({'answer': f'Demo study hint for {context}: break the problem into smaller steps. First, state what you know; next, identify an assumption you can test; finally, describe how you would verify the outcome. For your question, “{question}”, try explaining one real-world example and checking it against the course material. Configure OPENAI_API_KEY for personalised AI responses.', 'mode': 'template'})

@csrf_exempt
@require_http_methods(['PATCH'])
def edit_course(request, slug):
    """Demo instructor editor: deliberately not exposed as a public production API."""
    item = get_object_or_404(ContentItem, slug=slug, kind='course')
    data = parse_body(request)
    if data is None:
        return error('Invalid JSON')
    title = str(data.get('title', item.title)).strip()[:160]
    summary = str(data.get('summary', item.summary)).strip()[:250]
    lessons = data.get('lessons', item.body.get('lessons', []))
    if not title or not summary:
        return error('Title and summary are required')
    if not isinstance(lessons, list) or not 1 <= len(lessons) <= 10:
        return error('Supply between 1 and 10 lessons')
    if any(not isinstance(x, dict) or not str(x.get('title', '')).strip() or not str(x.get('text', '')).strip() for x in lessons):
        return error('Every lesson must have a title and text')
    item.title = title
    item.summary = summary
    item.body = {**item.body, 'lessons': [{'title': str(x['title'])[:160], 'text': str(x['text'])[:5000]} for x in lessons]}
    item.save(update_fields=['title', 'summary', 'body'])
    return JsonResponse({'ok': True, 'message': 'Course changes saved.'})
