from django.db import models

# Create your models here.
class Paper(models.Model):
    title = models.TextField(name='Title', unique=True)
    authors = models.JSONField(name='Authors', blank=False,default=list)
    abstract = models.CharField(name='Abstract', blank=False, editable=True, max_length=50000)
    pdfLink = models.URLField(name='Pdf')
    paperLink = models.URLField(name='PaperLink', unique=True)
    bookmarks = models.ManyToManyField('Bookmark', related_name='papers',blank=True);
    tags = models.JSONField(name='Tags', editable=True, default=list)
    
class Bookmark(models.Model):
    page = models.IntegerField();
    text = models.TextField();