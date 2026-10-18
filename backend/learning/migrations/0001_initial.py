from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        migrations.CreateModel(name='CareerPath', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('slug', models.SlugField(unique=True)), ('title', models.CharField(max_length=100)),
            ('subtitle', models.CharField(max_length=150)), ('description', models.TextField()),
            ('accent', models.CharField(default='blue', max_length=30)), ('icon', models.CharField(default='code', max_length=30))]),
        migrations.CreateModel(name='Stage', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('position', models.PositiveSmallIntegerField()), ('title', models.CharField(max_length=120)),
            ('description', models.CharField(max_length=240)), ('icon', models.CharField(default='book', max_length=30)),
            ('accent', models.CharField(default='blue', max_length=30)),
            ('path', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='stages', to='learning.careerpath'))],
            options={'ordering': ['position', 'id']}),
        migrations.CreateModel(name='Learner', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('demo_key', models.SlugField(unique=True)), ('name', models.CharField(max_length=100)),
            ('initials', models.CharField(max_length=3)), ('background', models.CharField(default='non_cs', max_length=12)),
            ('streak', models.PositiveSmallIntegerField(default=3)),
            ('path', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='learning.careerpath'))]),
        migrations.CreateModel(name='ContentItem', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('slug', models.SlugField(unique=True)), ('kind', models.CharField(choices=[('course', 'Course'), ('mission', 'Mission')], max_length=10)),
            ('title', models.CharField(max_length=160)), ('summary', models.CharField(max_length=250)),
            ('minutes', models.PositiveSmallIntegerField(default=15)), ('xp', models.PositiveSmallIntegerField(default=100)),
            ('difficulty', models.CharField(default='Beginner', max_length=30)), ('icon', models.CharField(default='book', max_length=30)),
            ('tags', models.JSONField(default=list)), ('body', models.JSONField(default=dict)),
            ('created_by_instructor', models.BooleanField(default=False)),
            ('stage', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='learning.stage'))],
            options={'ordering': ['id']}),
        migrations.CreateModel(name='Completion', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('score', models.PositiveSmallIntegerField(default=100)), ('completed_at', models.DateTimeField(auto_now_add=True)),
            ('item', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='learning.contentitem')),
            ('learner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='completions', to='learning.learner'))]),
        migrations.CreateModel(name='Assignment', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('audience', models.CharField(default='Class A', max_length=120)),
            ('due_date', models.DateField(blank=True, null=True)), ('assigned_at', models.DateTimeField(auto_now_add=True)),
            ('item', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='learning.contentitem'))],
            options={'ordering': ['-assigned_at']}),
        migrations.AddConstraint(model_name='completion', constraint=models.UniqueConstraint(fields=('learner', 'item'), name='one_completion_per_learner_item')),
    ]
