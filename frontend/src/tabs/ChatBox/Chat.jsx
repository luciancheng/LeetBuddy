import './Chat.css';
import { FaDisplay } from "react-icons/fa6";
import { useState } from 'react';

const Chat = () => {
    const [inputtext, setInputtext] = useState("");

    const handleSubmit = (e) => {

    }

    function handleInput(e) {
        e.target.style.height = 'auto'; // Reset the height to auto to recalculate
        e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`; // Adjust height dynamically
    }
    
    return ( 
        <div className="main-display-box h-full flex flex-col">
            <div className="main-display-box-header p-2 text-sm">
                <div className="flex items-center gap-1">
                    <FaDisplay/>
                    Chat
                </div>
            </div>
            <div className="flex-grow p-2 flex flex-col justify-end gap-2">
                {/* Div containing text */}
                <div className="flex-grow">

                </div>

                {/* Div for input textbook and common buttons */}
                <div className="">
                    
                    <form className="" action="" onSubmit={handleSubmit}>
                        <div className="text-input w-full">
                            <textarea 
                            type="text" 
                            className="chat-input-textbox w-full p-2 text-sm h-full" 
                            placeholder="Ask LeetAI ✦"
                            onChange={(e) => {setInputtext(e.target.value)}}
                            value={inputtext}
                            maxLength="300"
                            onInput={handleInput} 
                            >

                            </textarea>
                        </div>
                        
                
                    </form>
                </div>
            </div>
        </div>
    );
}
 
export default Chat;