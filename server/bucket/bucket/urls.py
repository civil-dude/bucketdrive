"""
URL configuration for bucket project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import include,path 
from rest_framework import routers 
from api import views

router = routers.DefaultRouter()
router.register(r'papers', views.PaperViewSet, basename='Paper')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/fetch-paper/', views.PaperFetchView.as_view(), name='paper-fetch-api'),
    path('api/paper/<str:paperId>/bookmarks/', views.PaperBookmarksView.as_view(), name='paper-bookmarks'),
    path('api/paper/<str:paperId>/bookmarks/create/', views.BookmarkCreateView.as_view(), name='bookmark-create')
]

