import { useParams } from "react-router-dom";
import '../index.css';
import { useEffect, useState} from "react";
import axios from "axios";             
import {Page, Document, pdfjs} from 'react-pdf';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHighlighter, faBookmark} from "@fortawesome/free-solid-svg-icons";

const DetailPage = () => {
    pdfjs.GlobalWorkerOptions.workerSrc = 
    `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
    const { paperId } = useParams();
    
    //const [pdfLink, setPdfLink] = useState<string | null>(null);    
    const [numPages,setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [paperData, setPaperData] = useState<{pdfLink: string}| null>(null);

    // bookmarking stuff

    const [selectedText, setSelectedText] = useState("");
    const [isTextSelected, setIsTextSelected] = useState(false);
    const [selectedTextPosition, setSelectedTextPosition] = useState({top: 0, left: 0});

    // bookmarks
    const  [bookmarks, setBookMarks] = useState([]);


    //const location = useLocation();
    //console.log("PaperID : ", paperID)
    const paperLink = `https://arxiv.org/abs/${paperId}`;
    
    useEffect(() => {
        const fetchPaperDetails = async () => {
            try{
                const response = await axios.get('http://127.0.0.1:8000/api/fetch-paper/', {
                   params: {
                    url: paperLink,
                   } 
                });
                console.log("Response : ", response);
                if (response.data.Title && response.data.Authors && response.data.Abstract && response.data.Pdf){
                    const {Title, Authors, Abstract, Pdf} = response.data;
                    console.log(Title,Authors, Abstract)
                    setPaperData({ pdfLink : Pdf })
                }
                if (Array.isArray(response.data) && response.data.length >= 4){
                    const pdfLink: string = response.data[3]
                    setPaperData({ pdfLink })
                } else {
                    console.error('Invalid response format : ', response);
                }

            } catch (error){
                console.error("Error fetching paper details: ", error)
            
            }
        }
       
        fetchPaperDetails();
    },[paperLink, paperId])
    
    useEffect(() => {

        const fetchBookmarksForPaper = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/paper/${paperId}/bookmarks/`)
                const bookmarks = response.data.bookmarks; 
                console.log("Bookmarks : ",bookmarks);
            }
            catch(error){
                console.error(error)
            }
        };
        fetchBookmarksForPaper();

    },[paperId])

    

    const onDocumentLoadSuccess = ({numPages} : {numPages: number}) => {
        setNumPages(numPages);
        setPageNumber(1);
    };
    const handlePrevPage = () => {
        if (pageNumber > 1){
            setPageNumber(pageNumber-1);
        }
    }
    const handleNextPage = () => {
        if (pageNumber < numPages) {
            setPageNumber(pageNumber + 1);

        }
    }

    const handleBookMark = () => {
        try{
        if(isTextSelected){
            // capture the text selected and its page number
            const bookmarkData = {
                page: pageNumber,
                text: selectedText,
                paper_id: paperId,
            };
            console.log("Bookmark : ",bookmarkData);
            const req = axios.post(`http://127.0.0.1:8000/api/paper/${paperId}/bookmarks/create/`, bookmarkData)
            .then(response => {
                console.log(response);
            })
            .catch(error => {
                console.error(error);
            });
        }}
        catch(error){
            console.error(error);
        }
    };

    const handleTextSelection = () => {
        const selectedText = window.getSelection()?.toString().trim() || " ";
        setSelectedText(selectedText);
        setIsTextSelected(selectedText !== "");

        if (selectedText !== ""){
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0){
            const range = selection?.getRangeAt(0);
            const rect = range?.getBoundingClientRect();
            setSelectedTextPosition({
                top: rect?.top + window.scrollY,
                left: rect?.left + window.scrollX,
            });
        } else {
            setSelectedTextPosition({top: 0, left: 0});
        }
    }}

   

    useEffect(() => {
        // add a listener for text selection
        document.addEventListener("mouseup", handleTextSelection);
        return () => {
            document.removeEventListener("mouseup", handleTextSelection);
        };
    },[]);


    return (
        <div className="Detail__Page">
           {paperData &&  
            <div className="pdf__viewer">
                 <div className="button__container">
                   <button className="bg-white-500 hover:bg-cyan-500 text-black font-bold py-2 px-4 rounded" onClick={handlePrevPage} disabled={pageNumber === 1}>Previous</button>
                   <button className="bg-white-500 hover:bg-cyan-500 text-black font-bold py-2 px-4 rounded" onClick={handleNextPage} disabled={pageNumber === numPages}>Next</button>
                   {/* {bookmarks.length > 0 && (
                       <select className="bookmark__dropdown">
                           {bookmarks.map((bookmark: { page: number, text: string }, index: number) => (
                               <option key={index} value={bookmark.page}>
                                   {bookmark.text}
                               </option>
                           ))}
                       </select>
                   )} */}
                   </div>
                   {isTextSelected && (
                    <div className="pdf__menu" style={{
                        top: `${selectedTextPosition.top}px`,
                        left: `${selectedTextPosition.left}px`,
                    }}>                                    
                <FontAwesomeIcon 
                    icon={faBookmark} 
                    style={{
                        fontSize: 20, 
                        marginTop: 10, 
                        marginRight: 20, 
                        marginLeft: 30,
                        transition: "font-size 0.3s, color 0.3s",
                        cursor: "pointer",
                    }} 
                    onClick={handleBookMark} />

             </div>
                )}
                <Document className="pdf__canvas" file={paperData.pdfLink} onLoadSuccess={onDocumentLoadSuccess}> 
                   <Page className="pdf__page" pageNumber={pageNumber} />
                </Document>
                <p>
                    Page {pageNumber} of {numPages}
                 </p>
             </div>
           }
        </div>
    )
}

export default DetailPage;