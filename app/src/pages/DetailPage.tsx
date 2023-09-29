import { useParams } from "react-router-dom";
import '../index.css';
import { useEffect, useState} from "react";
import axios from "axios";             
import {Page, Document, pdfjs} from 'react-pdf';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHighlighter} from "@fortawesome/free-solid-svg-icons";

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

    // highlight pen stuff
    const [highlighted, setHightlighted] = useState(false);


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
                console.log("Response type : ", typeof(response.data));
                console.log("Title : ", response.data.Title);
                if (response.data.Title && response.data.Authors && response.data.Abstract && response.data.Pdf){
                    const {Title, Authors, Abstract, Pdf} = response.data;
                    console.log(Title,Authors, Abstract)
                    setPaperData({ pdfLink : Pdf })
                }
                if (Array.isArray(response.data) && response.data.length >= 4){
                    const pdfLink: string = response.data[3]
                    setPaperData({ pdfLink })
                } else {
                    console.error('Invalid response format : ', response.data);
                }

            } catch (error){
                console.error("Error fetching paper details: ", error)
            
            }
        }
        fetchPaperDetails();
    },[paperLink])

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
        if(isTextSelected){
            // capture the text selected and its page number
            const bookmark = {
                page: pageNumber,
                text: selectedText,
            };
            console.log("Bookmark : ", bookmark);
        } 
    };
    const handleTextSelection = () => {
        const selectedText = window.getSelection()?.toString().trim() || "";
        setSelectedText(selectedText);
        setIsTextSelected(selectedText !== "");
    };

    const handleHightlighter = () => {

    }

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
                   {isTextSelected && (
                    <div className="pdf__menu">                                    
                 <button  onClick={handleBookMark}>BookMark</button>
                 <FontAwesomeIcon icon={faHighlighter} style={{color:"#f26418"}} onClick={handleHightlighter} />                  </div>
                )}

                   </div>
                 <Document className="pdf__canvas"
                 file={paperData.pdfLink}
                 onLoadSuccess={onDocumentLoadSuccess}> 
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