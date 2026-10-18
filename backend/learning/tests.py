import json
from django.test import TestCase
from django.core.management import call_command
from .models import Assignment, Completion, ContentItem, Learner


class DemoApiTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command('seed_demo', verbosity=0)

    def test_health_and_bootstrap(self):
        self.assertEqual(self.client.get('/api/health/').status_code, 200)
        response = self.client.get('/api/bootstrap/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['paths']), 2)
        self.assertGreater(len(response.json()['stages']), 4)

    def test_switch_career_path(self):
        res = self.client.patch('/api/learner/', data=json.dumps({'path': 'scrum-master', 'background': 'cs'}), content_type='application/json')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(self.client.get('/api/bootstrap/').json()['learner']['path'], 'scrum-master')

    def test_quiz_rejects_wrong_answer_and_awards_once(self):
        url = '/api/items/git-quest/complete/'
        student = Learner.objects.get(demo_key='alex')
        self.assertEqual(self.client.post(url, data=json.dumps({'answer': 0}), content_type='application/json').json()['passed'], False)
        self.assertFalse(Completion.objects.filter(learner=student, item__slug='git-quest').exists())
        self.assertEqual(self.client.post(url, data=json.dumps({'answer': 2}), content_type='application/json').json()['xp_awarded'], 120)
        self.assertEqual(self.client.post(url, data=json.dumps({'answer': 2}), content_type='application/json').json()['xp_awarded'], 0)

    def test_sprint_validates_four_tasks(self):
        url = '/api/items/sprint-planning/complete/'
        self.assertEqual(self.client.post(url, data=json.dumps({'selected': ['database']}), content_type='application/json').status_code, 400)
        res = self.client.post(url, data=json.dumps({'selected': ['database', 'api', 'ui', 'tests']}), content_type='application/json')
        self.assertTrue(res.json()['passed'])

    def test_instructor_create_edit_and_assign(self):
        stage_id = self.client.get('/api/bootstrap/').json()['stages'][0]['id']
        created = self.client.post('/api/instructor/courses/', data=json.dumps({'topic': 'Software Requirements', 'stage_id': stage_id}), content_type='application/json')
        self.assertEqual(created.status_code, 201)
        slug = created.json()['slug']
        self.assertEqual(ContentItem.objects.get(slug=slug).created_by_instructor, True)
        edited = self.client.patch(f'/api/instructor/courses/{slug}/', data=json.dumps({'title': 'Better Requirements', 'summary': 'Updated description', 'lessons': [{'title': 'Needs', 'text': 'Interview stakeholders.'}]}), content_type='application/json')
        self.assertEqual(edited.status_code, 200)
        self.assertEqual(ContentItem.objects.get(slug=slug).title, 'Better Requirements')
        assigned = self.client.post('/api/instructor/assignments/', data=json.dumps({'item_slug': slug, 'audience': 'Class B'}), content_type='application/json')
        self.assertEqual(assigned.status_code, 201)
        self.assertTrue(Assignment.objects.filter(item__slug=slug, audience='Class B').exists())
