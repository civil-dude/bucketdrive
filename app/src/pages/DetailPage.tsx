import { useParams } from "react-router-dom";
import '../index.css';
import React, { useEffect, useState} from "react";
import axios from "axios";             
import {Page, Document, pdfjs} from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import "react-pdf/dist/esm/Page/TextLayer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHighlighter, faBookmark} from "@fortawesome/free-solid-svg-icons";

const DetailPage = () => {
    pdfjs.GlobalWorkerOptions.workerSrc = 
    `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
    const { paperId } = useParams();
    
    //const [pdfLink, setPdfLink] = useState<string | null>(null);    
    const [numPages,setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [zoomLevel, setZoomLevel] = useState<number>(1);
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

    return (
        <div className="Detail__Page">
           {/* <span className="bg-white-500 hover:bg-gray-100 text-black font-bold py-2 px-4 rounded" onClick={generateSummary}>Use AI Summary 🪄  ? </span>*/}
           {paperData &&  
            <div className="pdf__viewer">
                 <div className="button__container">
                   <button className="bg-white-500 hover:bg-cyan-500 text-black font-bold py-2 px-4 rounded" onClick={handlePrevPage} disabled={pageNumber === 1}>Previous</button>
                   <button className="bg-white-500 hover:bg-cyan-500 text-black font-bold py-2 px-4 rounded" onClick={handleNextPage} disabled={pageNumber === numPages}>Next</button>
                 </div>
                    
                <Document className="pdf__canvas" file={paperData.pdfLink} onLoadSuccess={onDocumentLoadSuccess}> 
                   <Page className="pdf__page" pageNumber={pageNumber} renderTextLayer={true} />
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