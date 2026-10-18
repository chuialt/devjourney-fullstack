from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health),
    path('bootstrap/', views.bootstrap),
    path('learner/', views.learner_update),
    path('items/<slug:slug>/', views.item_detail),
    path('items/<slug:slug>/complete/', views.complete_item),
    path('instructor/assignments/', views.assignments),
    path('instructor/courses/', views.create_course),
    path('instructor/courses/<slug:slug>/', views.edit_course),
    path('ai/tutor/', views.tutor),
]
