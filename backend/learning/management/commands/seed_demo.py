from django.core.management.base import BaseCommand
from learning.models import CareerPath, Stage, ContentItem, Learner, Completion, Assignment


PATHS = [
    ('developer', 'Software Developer', 'Build, create and ship real products', 'Learn software fundamentals, create features, test applications and collaborate with modern AI coding agents.', 'blue', 'code'),
    ('scrum-master', 'Scrum Master', 'Help teams work better together', 'Learn Agile thinking, facilitate sprint events, remove impediments and guide teams toward delivering value.', 'orange', 'users'),
]

STAGES = [
    (None, 1, 'The Newcomer', 'Discover how software is made and who makes it.', 'sprout', 'green'),
    (None, 2, 'The Builder', 'Learn essential tools, Git and basic development.', 'code', 'blue'),
    (None, 3, 'The Collaborator', 'Understand Agile teams and real development workflows.', 'users', 'purple'),
    (None, 4, 'The AI Explorer', 'Develop the judgement to work responsibly with AI.', 'sparkles', 'amber'),
    ('developer', 5, 'Junior Developer', 'Build, test and explain your first feature.', 'terminal', 'blue'),
    ('developer', 6, 'Release Ready', 'Debug real issues and deliver working software.', 'rocket', 'pink'),
    ('scrum-master', 5, 'Sprint Facilitator', 'Keep a team aligned with clear, useful Scrum events.', 'clipboard', 'orange'),
    ('scrum-master', 6, 'Agile Leader', 'Respond to change, support teams and improve delivery.', 'flag', 'pink'),
]


def course(slug, title, summary, icon, tags, lessons, minutes=12, xp=100):
    return dict(slug=slug, kind='course', title=title, summary=summary, icon=icon, tags=tags,
                minutes=minutes, xp=xp, body={'lessons': [{'title': a, 'text': b} for a, b in lessons]})


def quiz(slug, title, summary, icon, tags, question, options, correct, explanation, minutes=8, xp=120):
    return dict(slug=slug, kind='mission', title=title, summary=summary, icon=icon, tags=tags,
                minutes=minutes, xp=xp, body={'type': 'quiz', 'question': question, 'options': options,
                                              'correct': correct, 'explanation': explanation})


ITEMS = {
    'The Newcomer': [
        course('software-world', 'Welcome to the Software World', 'Understand the SDLC, software products and team roles.', 'book', ['Foundations', 'Beginner'], [
            ('What is software engineering?', 'Software engineering is the systematic way teams design, build, test and maintain software. It combines technical work with collaboration, planning and quality. A successful product solves a real user problem.'),
            ('The development life cycle', 'A common project moves through discovering needs, planning, designing, implementing, testing, releasing and improving. These activities often repeat rather than happening only once. Teams use feedback to correct assumptions early.'),
            ('Who works on a product?', 'Developers implement solutions, testers investigate quality, designers improve usability and product owners clarify value. Scrum Masters help teams work effectively. Roles vary by organisation and often overlap.'),
        ]),
        quiz('team-roles', 'Meet the Software Team', 'Match a workplace problem with the right responsibility.', 'users', ['Role play'],
             'A team cannot agree on what a new feature should achieve. What should they clarify first?',
             ['The stakeholder need and acceptance criteria', 'Which color the IDE should use', 'How many lines of code to write', 'The release date without asking users'], 0,
             'Clear requirements and acceptance criteria help the whole team understand what success means.'),
    ],
    'The Builder': [
        course('git-essentials', 'Git Without the Guesswork', 'Learn commits, branches, pull requests and code review.', 'git', ['Git', 'Collaboration'], [
            ('Why version control matters', 'Version control records changes and helps teams collaborate without overwriting each other. A Git repository contains project history. Commits capture useful milestones.'),
            ('Branches and pull requests', 'Branches let you work on a feature separately from the main code. A pull request proposes changes and gives teammates a chance to review them. Merge after feedback and testing.'),
            ('A safe everyday workflow', 'Pull the latest changes, make a focused branch, implement and test your work, commit clearly, then open a pull request. Always check the diff before merging.'),
        ]),
        quiz('git-quest', 'Git Branch Quest', 'Choose the next step in a realistic teamwork scenario.', 'git', ['Interactive', 'Git'],
             'You have finished a bug fix in your feature branch. What is the best next step before merging into main?',
             ['Force-push straight to main', 'Delete the branch', 'Test the fix and open a pull request for review', 'Ignore failing tests'], 2,
             'Testing and reviewing a pull request reduces the risk of introducing regressions into the shared codebase.'),
    ],
    'The Collaborator': [
        course('scrum-basics', 'Agile & Scrum in Real Life', 'Understand the Scrum roles, events and product backlog.', 'layers', ['Scrum', 'Teamwork'], [
            ('Agile is a mindset', 'Agile teams work in small increments and learn from feedback. Instead of treating a plan as fixed, they adapt while keeping the user goal clear. Scrum is one framework teams can use.'),
            ('A Scrum team', 'The Product Owner is accountable for maximising product value and managing the Product Backlog. The Scrum Master helps the team use Scrum effectively. Developers create a usable Increment.'),
            ('Sprint events', 'Sprint Planning establishes a Sprint Goal and plan. The Daily Scrum helps Developers inspect progress. Sprint Review gathers feedback on results, while the Retrospective improves how the team works.'),
        ]),
        dict(slug='sprint-planning', kind='mission', title='Sprint Planning Challenge',
             summary='Build a balanced backlog for a study-resource saving feature.', icon='gamepad', tags=['Scrum', 'Hands-on'], minutes=15, xp=180,
             body={'type': 'sprint', 'scenario': 'Your team is building StudyBuddy. Students need to save learning resources and find them later. Choose four essential sprint tasks that cover the end-to-end feature.',
                   'tasks': [
                       {'id': 'database', 'title': 'Design a schema for saved resources', 'category': 'Backend', 'points': 3},
                       {'id': 'ui', 'title': 'Create the Save button interface', 'category': 'Frontend', 'points': 2},
                       {'id': 'api', 'title': 'Implement save/remove API endpoints', 'category': 'Backend', 'points': 3},
                       {'id': 'tests', 'title': 'Write tests for saving resources', 'category': 'Testing', 'points': 2},
                       {'id': 'animation', 'title': 'Add a decorative confetti animation', 'category': 'Polish', 'points': 1},
                       {'id': 'theme', 'title': 'Redesign the entire color palette', 'category': 'Polish', 'points': 5},
                   ]}),
    ],
    'The AI Explorer': [
        course('ai-agents', 'Working with AI Coding Agents', 'Practise delegation, prompts, verification and accountability.', 'sparkles', ['AI Fluency', 'Career skills'], [
            ('Delegate deliberately', 'AI tools can draft boilerplate, tests and explanations. Human developers still own requirements, architecture and the final result. Choose work for AI based on risk and your ability to verify it.'),
            ('Describe the task clearly', 'State the goal, context, constraints and definition of done. Request small, testable changes instead of a whole application in one message. Specific instructions usually make review easier.'),
            ('Discern and verify', 'Inspect generated code for correctness, privacy, security and maintainability. Run tests, check edge cases and document what you changed. AI fluency requires diligence, not just prompting.'),
        ]),
        quiz('ai-review', 'AI Output Review', 'Catch a mistake that an AI coding assistant might overlook.', 'shield', ['AI Fluency', 'Code review'],
             'An AI agent generated login code that prints passwords to the server log. What should you do?',
             ['Merge because the code runs', 'Remove the sensitive logging, verify the fix and run tests', 'Share the log with classmates', 'Assume the AI knows best'], 1,
             'Never log passwords or secrets. Generated code needs human review, testing and security checks.'),
    ],
    'Junior Developer': [
        course('feature-builder', 'Build Your First Feature', 'Plan a small feature and implement it with a clean workflow.', 'terminal', ['Developer', 'Projects'], [
            ('Start from user stories', 'Describe the user, desired capability and value. Turn the story into observable acceptance criteria. Consider unhappy paths before coding.'),
            ('Build in small increments', 'Implement the simplest working change and test it locally. Use clear functions and names that explain intent. Review every generated line when using a coding assistant.'),
            ('Ready for review', 'Write a helpful pull request description with what changed, why and how it was tested. Include screenshots for UI changes and note known limitations.'),
        ]),
        quiz('bug-detective', 'Bug Detective', 'Investigate a subtle but common software failure.', 'search', ['Debugging'],
             'A user presses Save twice and sees two identical records. Which approach is most robust?',
             ['Hide the Save button permanently', 'Refresh the browser on every click', 'Make the save operation idempotent and disable duplicate submissions', 'Ignore duplicate data'], 2,
             'Prevent duplicate submissions in the UI and enforce safe behavior on the server or database.'),
    ],
    'Release Ready': [
        course('testing-deployment', 'Testing & Release Essentials', 'Learn unit tests, integration tests and deployment checks.', 'rocket', ['Testing', 'Deployment'], [
            ('What should you test?', 'Unit tests check focused behavior; integration tests verify cooperating components. Also test errors, boundaries, and important user flows. No single test type catches every issue.'),
            ('Before production', 'Review environment variables, secrets, database migrations and deployment configuration. Use a staging environment where possible. Keep a rollback plan.'),
            ('After release', 'Monitor errors, performance and user feedback. A release is a milestone rather than the end of development. Prioritise fixes based on impact.'),
        ]),
        quiz('release-day', 'Release Day Decision', 'Respond to a production incident sensibly.', 'flag', ['Professional practice'],
             'Immediately after a deployment, users cannot log in. What should the team do first?',
             ['Wait until tomorrow', 'Assess impact and roll back or mitigate while investigating', 'Delete the test suite', 'Make unrelated UI changes'], 1,
             'Restoring service is the priority; investigate the root cause and prevent recurrence after the system is stable.'),
    ],
    'Sprint Facilitator': [
        course('facilitating-scrum', 'Facilitating Effective Scrum Events', 'Make planning, review and retrospectives valuable.', 'clipboard', ['Scrum Master', 'Facilitation'], [
            ('Before the event', 'Know the purpose, participants and information needed. Ask the team what decisions need to be made. Prepare enough structure to keep discussion focused.'),
            ('During discussion', 'Invite quieter voices, keep the group focused on its goal and make blockers visible. Facilitation is not the same as directing team members. Help people make their own decisions.'),
            ('After the event', 'Record agreed actions, owners and follow-ups. Check whether the meeting created value. Improve the format based on team feedback.'),
        ]),
        quiz('sprint-crisis', 'Sprint Crisis Simulator', 'Handle a sudden requirement change without derailing the team.', 'alert', ['Role play', 'Scrum'],
             'Mid-sprint, a stakeholder asks for an urgent new feature. What should a Scrum Master encourage?',
             ['Immediately assign overtime', 'Discuss the request with the Product Owner and Developers and examine the Sprint Goal impact', 'Change every task without speaking to the team', 'Cancel all future Sprint Reviews'], 1,
             'The team and Product Owner should collaborate on scope changes while protecting the Sprint Goal and transparency.'),
    ],
    'Agile Leader': [
        course('retrospectives', 'Better Retrospectives', 'Use evidence and facilitation to drive continuous improvement.', 'users', ['Agile', 'Leadership'], [
            ('Create safety', 'Start with a shared goal and focus on behaviors and systems rather than blame. Agree that participants can discuss problems respectfully. Psychological safety makes improvement possible.'),
            ('Look for patterns', 'Gather observations from the sprint, group related issues and explore root causes. Separate facts from assumptions. Avoid jumping to solutions too early.'),
            ('Choose one improvement', 'Agree on a small, achievable experiment with an owner and a review date. In the next retrospective, evaluate whether it helped. Continuous improvement is iterative.'),
        ]),
        quiz('stakeholder-dialogue', 'Stakeholder Meeting', 'Choose a response that builds trust and clarity.', 'message', ['Communication', 'Leadership'],
             'A stakeholder says your team is too slow. Which response is most constructive?',
             ['Tell them they are wrong', 'Promise twice the output without checking', 'Ask what outcomes matter, review delivery data together and discuss impediments', 'Stop sharing progress'], 2,
             'Open questions, shared goals and evidence support constructive collaboration.'),
    ],
}


class Command(BaseCommand):
    help = 'Populate an idempotent DevJourney demonstration dataset.'

    def handle(self, *args, **kwargs):
        paths = {}
        for slug, title, subtitle, desc, accent, icon in PATHS:
            paths[slug], _ = CareerPath.objects.update_or_create(slug=slug,
                   defaults=dict(title=title, subtitle=subtitle, description=desc, accent=accent, icon=icon))
        stages = {}
        for path_slug, position, title, desc, icon, accent in STAGES:
            stage, _ = Stage.objects.update_or_create(path=paths.get(path_slug), position=position,
                    defaults=dict(title=title, description=desc, icon=icon, accent=accent))
            stages[title] = stage
        items = {}
        for stage_name, content in ITEMS.items():
            for data in content:
                item, _ = ContentItem.objects.update_or_create(slug=data['slug'], defaults={**data, 'stage': stages[stage_name]})
                items[data['slug']] = item
        for key, name, initials, bg, path, streak in [
            ('alex', 'Alex Chen', 'AC', 'non_cs', 'developer', 12),
            ('maya', 'Maya Patel', 'MP', 'cs', 'developer', 5),
            ('daniel', 'Daniel Park', 'DP', 'non_cs', 'scrum-master', 3),
            ('sophie', 'Sophie Lee', 'SL', 'cs', 'developer', 9),
            ('omar', 'Omar Khan', 'OK', 'non_cs', 'scrum-master', 4),
        ]:
            student, _ = Learner.objects.update_or_create(demo_key=key,
                         defaults={'name': name, 'initials': initials, 'background': bg, 'path': paths[path], 'streak': streak})
            completed_by = {
                'alex': ['software-world', 'team-roles', 'git-essentials'],
                'maya': ['software-world', 'team-roles', 'git-essentials', 'git-quest', 'scrum-basics', 'sprint-planning'],
                'daniel': ['software-world', 'team-roles'],
                'sophie': ['software-world', 'team-roles', 'git-essentials', 'git-quest', 'scrum-basics', 'sprint-planning', 'ai-agents', 'ai-review'],
                'omar': ['software-world', 'team-roles', 'git-essentials', 'git-quest'],
            }[key]
            for slug in completed_by:
                Completion.objects.get_or_create(learner=student, item=items[slug], defaults={'score': 100})
        for slug, audience in [('software-world', 'Class A'), ('sprint-planning', 'Class A'), ('ai-agents', 'Class B')]:
            Assignment.objects.get_or_create(item=items[slug], audience=audience)
        self.stdout.write(self.style.SUCCESS(f'Demo ready: {len(paths)} paths, {len(stages)} stages, {len(items)} lessons/missions.'))
