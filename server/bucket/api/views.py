from api.serializers import PaperSerializer, BookmarkSerializer
from rest_framework.views import APIView 
from api.script import extract_paper_info
from rest_framework.response import Response
from rest_framework import status, viewsets, generics 
from api.models import Paper, Bookmark


class PaperViewSet(viewsets.ModelViewSet):
    """ 
    # API endpoint
    # """
    queryset = Paper.objects.all()
    serializer_class = PaperSerializer
    
    # Check if the paper already exists
   

    
    
    # def post(self, request):
    #     # deserializer the JSON data using your PaperSerializer
        
    #     serializer = PaperSerializer(data=request.data)
        
    #     try:
    #         serializer.is_valid(raise_exception=True)
    #     except Exception as err:
    #         return Response({'error': str(err)}, status=status.HTTP_400_BAD_REQUEST)
        
        
    #     serializer.save()
    #     return Response(serializer.data,status=status.HTTP_201_CREATED)
    
class PaperFetchView(APIView):
    def get(self, request):
        print("Request data : ", request)
        req = request.query_params.get('url')
        print("Url : ", req)
        
        # Check if the paper already exists in the database
        try: 
            if Paper.objects.filter(PaperLink=req).exists():
                paper = Paper.objects.get(PaperLink=req)
                serializer = PaperSerializer(paper)
                print("Data is outputing from here : ", serializer)
                return Response(serializer.data, status=status.HTTP_200_OK)
        
        except Exception as err:
            print(err) 
        #Response(err, status=status.HTTP_400_BAD_REQUEST)
        # If the paper doesn't exist, fetch the details from the source
        
        ret = extract_paper_info(req)
        
        if ret:
            return Response(ret, status=status.HTTP_200_OK)
        else:
            return Response({"message": "Paper data can't be extracted from source."}, status=status.HTTP_404_NOT_FOUND)

class BookmarkCreateView(generics.CreateAPIView):
    queryset = Bookmark.objects.all()
    serializer_class = BookmarkSerializer;
    
    def perform_create(self, serializer):
        paperLink = 'https://arxiv.org/abs/' + self.kwargs.get('paperId')
        print("PaperLink  : ", paperLink)
        
        
        try:
            paper = Paper.objects.get(PaperLink=paperLink)
        except Paper.DoesNotExist:
            pass
        
        else:
            bookmark = serializer.save()
            paper.bookmarks.add(bookmark)
            
            num_bookmarks = paper.bookmarks.count()
            return Response({'num_bookmarks: ': num_bookmarks}, status=status.HTTP_201_CREATED)
        
class PaperBookmarksView(APIView):
    def get(self, request, paperId):
        try:
            paperLink = 'https://arxiv.org/abs/'+paperId 
            print("PaperLink for bookmarks : ", paperLink)
            paper = Paper.objects.get(PaperLink=paperLink)
        except Paper.DoesNotExist:
            return Response({'message': 'Paper not found'}, status=status.HTTP_404_NOT_FOUND)
        
        bookmarks = paper.bookmarks.all()
        bookmark_serializer = BookmarkSerializer(bookmarks, many=True)
        return Response({'bookmarks': bookmark_serializer.data})