from django.db import models


class CareerPath(models.Model):
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=100)
    subtitle = models.CharField(max_length=150)
    description = models.TextField()
    accent = models.CharField(max_length=30, default='blue')
    icon = models.CharField(max_length=30, default='code')

    def __str__(self):
        return self.title


class Stage(models.Model):
    path = models.ForeignKey(CareerPath, null=True, blank=True, on_delete=models.CASCADE, related_name='stages')
    position = models.PositiveSmallIntegerField()
    title = models.CharField(max_length=120)
    description = models.CharField(max_length=240)
    icon = models.CharField(max_length=30, default='book')
    accent = models.CharField(max_length=30, default='blue')

    class Meta:
        ordering = ['position', 'id']

    def __str__(self):
        return self.title


class ContentItem(models.Model):
    COURSE = 'course'
    MISSION = 'mission'
    KIND_CHOICES = [(COURSE, 'Course'), (MISSION, 'Mission')]
    slug = models.SlugField(unique=True)
    stage = models.ForeignKey(Stage, on_delete=models.CASCADE, related_name='items')
    kind = models.CharField(max_length=10, choices=KIND_CHOICES)
    title = models.CharField(max_length=160)
    summary = models.CharField(max_length=250)
    minutes = models.PositiveSmallIntegerField(default=15)
    xp = models.PositiveSmallIntegerField(default=100)
    difficulty = models.CharField(max_length=30, default='Beginner')
    icon = models.CharField(max_length=30, default='book')
    tags = models.JSONField(default=list)
    body = models.JSONField(default=dict)
    created_by_instructor = models.BooleanField(default=False)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return self.title


class Learner(models.Model):
    demo_key = models.SlugField(unique=True)
    name = models.CharField(max_length=100)
    initials = models.CharField(max_length=3)
    background = models.CharField(max_length=12, default='non_cs')
    path = models.ForeignKey(CareerPath, null=True, on_delete=models.SET_NULL)
    streak = models.PositiveSmallIntegerField(default=3)

    def __str__(self):
        return self.name


class Completion(models.Model):
    learner = models.ForeignKey(Learner, on_delete=models.CASCADE, related_name='completions')
    item = models.ForeignKey(ContentItem, on_delete=models.CASCADE)
    score = models.PositiveSmallIntegerField(default=100)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['learner', 'item'], name='one_completion_per_learner_item')]


class Assignment(models.Model):
    item = models.ForeignKey(ContentItem, on_delete=models.CASCADE)
    audience = models.CharField(max_length=120, default='Class A')
    due_date = models.DateField(null=True, blank=True)
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-assigned_at']
