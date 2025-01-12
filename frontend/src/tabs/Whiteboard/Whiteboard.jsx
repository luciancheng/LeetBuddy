import './Whiteboard.css';
import { Tldraw, DefaultSizeStyle, exportToBlob } from 'tldraw';
import 'tldraw/tldraw.css';
import { FaShareFromSquare, FaDrawPolygon } from "react-icons/fa6";
import { useRef, useContext, useState } from 'react';
import { Context } from '../../Store';

const Whiteboard = () => {
    DefaultSizeStyle.setDefaultValue('s');
    const editorRef = useRef(null); // Ref to store the editor instance

    const { pageData, base64imageData } = useContext(Context);
    const [page, setPage] = pageData;
    const [base64image, setBase64image] = base64imageData;
    const [isExporting, setIsExporting] = useState(false);
    
    // function to conver to base 64
    const convertBlobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob); // Convert blob to base64
        });
    };

    const handleSave = async () => {
        setIsExporting(true);
        const editor = editorRef.current; // Access the stored editor instance
        if (!editor) {
            alert('Editor not ready!');
            setIsExporting(false);
            return;
        }
        const shapeIds = editor.getCurrentPageShapeIds();
        if (shapeIds.size === 0) {
            setIsExporting(false);
            return alert('No shapes on the canvas');
        }

        const blob = await exportToBlob({
            editor,
            ids: [...shapeIds],
            format: 'png',
            opts: { background: false },
        });
        
        // uses the editor reference to export image
        // const link = document.createElement('a');
        // link.href = window.URL.createObjectURL(blob);
        // link.download = 'canvas-image.png';
        // link.click();

        // Convert the blob to base64 string
        const base64 = await convertBlobToBase64(blob);
        setBase64image(base64);
        setIsExporting(false);
        setPage("chat");

        // send base64 along with other information back to chat tab
        

        // Now you have the base64 string
        //console.log(base64); // You can log or use this string as needed

        // Example: You can create an image element using the base64 string
        //const img = new Image();
        //img.src = base64;
        //document.body.appendChild(img); // Display the image in the document
    };

    const components = {
        MenuPanel: null,
    };

    return (
        <div className="main-display-box h-full flex flex-col">
            <div className="main-display-box-header p-2 text-sm flex justify-between">
                <div className="flex items-center gap-1">
                    <FaDrawPolygon />
                    Draw
                </div>
                {isExporting ? (<p>Exporting...</p>) : (
                    <button
                        className="flex items-center gap-1 whiteboard-ask-button"
                        onClick={handleSave} // Use the handleSave function here
                    >
                        <FaShareFromSquare />
                        <p>Ask</p>
                    </button>
                )}
                
            </div>
            <div className="tldraw-container h-full">
                <Tldraw
                    inferDarkMode
                    persistenceKey="example"
                    onMount={(editorInstance) => {
                        editorRef.current = editorInstance; // Store the editor instance in the ref
                        editorInstance.setCurrentTool('draw');
                    }}
                    components={components}
                />
            </div>
        </div>
    );
};

export default Whiteboard;
