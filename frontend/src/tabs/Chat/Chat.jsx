import './Chat.css';
import { FaDisplay, FaTrashCan } from "react-icons/fa6";
import { useState, useRef, useEffect, useContext } from 'react';
import LLMOutputDisplay from '../../components/LLMOutputDisplay';
import { Context } from '../../Store';
import { collectPageContent } from './collectPageContent.js';
import laptopLogo from '../../assets/LBLOGOlaptop.png';
import { v4 as uuidv4 } from 'uuid';

const Chat = () => {
    const IN_DEV_MODE = import.meta.env.VITE_IN_DEV_MODE === "true" ? true : false;

    const [inputtext, setInputtext] = useState("");
    const [messages, setMessages] = useState([]);
    const [canEdit, setCanEdit] = useState(true);
    const [sessionKey, setSessionKey] = useState(null);
    const [problem, setProblem] = useState("");
    const messagesEndRef = useRef(null);  // Reference to the last message

    // base64 image context
    const { base64imageData } = useContext(Context);
    const [base64image, setBase64image] = base64imageData;

    // hovering
    const [isHovered, setIsHovered] = useState(false);

    const generationflag = "$$GENERATING$$";

    const storage = {
        save: (data) => {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.local.set({ chatHistory: data });
            } else {
                localStorage.setItem('chatHistory', JSON.stringify(data));
            }
        },
        load: async () => {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                return new Promise((resolve) => {
                    chrome.storage.local.get(['chatHistory'], (result) => {
                        resolve(result.chatHistory || []);
                    });
                });
            } else {
                const data = localStorage.getItem('chatHistory');
                return data ? JSON.parse(data) : [];
            }
        },
        clear: () => {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.local.remove(['chatHistory']);
            } else {
                localStorage.removeItem('chatHistory');
            }
        }
    };

    // Load messages from storage when component mounts
    useEffect(() => {
        const loadMessages = async () => {
            const savedMessages = await storage.load();
            if (savedMessages && savedMessages.length > 0) {
                setMessages(savedMessages);
            }
        };
        loadMessages();
    }, []);

    // Save messages to storage whenever they change
    useEffect(() => {
        if (messages.length > 0 && !messages.includes(generationflag)) {
            storage.save(messages);
        }
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (inputtext === "") {
            return;
        }
    
        const textarea = e.target.querySelector('.chat-input-textbox');
        if (textarea) {
            try {
                textarea.style.height = 'auto';
            } catch {
                console.log("error");
            }
        }
    
        let currentSessionKey = sessionKey;
    
        // Get the current active tab's URL
        if (!IN_DEV_MODE) {
            await new Promise((resolve) => {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    const currentUrl = tabs[0]?.url;
                    if (!currentUrl) {
                        console.error("Could not retrieve the current tab's URL.");
                        resolve();
                        return;
                    }
            
                    const regex = /^https:\/\/leetcode\.com\/problems\/([a-zA-Z][a-zA-Z-]*)/;
                    const match = currentUrl.match(regex);
            
                    if (match) {
                        const newProblemSlug = match[1];
                        
                        if (newProblemSlug !== problem) {
                            setProblem(newProblemSlug);
                            
                            const key = uuidv4();
                            sessionStorage.setItem('sessionKey', key);
                            setSessionKey(key);
                            currentSessionKey = key;
                            console.log("Generated new key:", key);
                        }
                    }
                    resolve();
                });
            });
        }
    
        const pageText = await collectPageContent();
    
        let displayinputtext = inputtext;
        if (base64image !== "") {
            displayinputtext += "\n\n + 1 Image";
        } 
    
        setMessages((prevMessages) => [...prevMessages, displayinputtext]);
        e.target.style.height = 'auto';
    
        setCanEdit(false);
        setMessages((prevMessages) => [...prevMessages, generationflag]);
        
        let formattedimage = null;
        if (base64image.length > 0) {
            formattedimage = base64image?.replace(/^data:image\/\w+;base64,/, '');
        }
    
        const body = { 
            question: inputtext, 
            image: formattedimage, 
            context: pageText,
            ...(currentSessionKey && { sessionID: currentSessionKey })
        };
    
        setBase64image("");
        fetch(import.meta.env.VITE_API_URL + `/LLM`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(body),
            credentials: 'include',
        })
            .then(res => res.json())
            .then(result => {
                setMessages((prevMessages) => prevMessages.slice(0, -1));
                setMessages((prevMessages) => [...prevMessages, result.res]);
                setCanEdit(true);
            }).catch(err => {
                console.log(err);
                setMessages((prevMessages) => prevMessages.slice(0, -1));
                setMessages((prevMessages) => [...prevMessages, "Error generating response. Try again."]);
                setCanEdit(true);
            });
    
        setInputtext("");
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    function handleInput(e) {
        // Reset height to auto to correctly calculate new height
        e.target.style.height = 'auto';
        
        // Calculate new height (limited to max height)
        const newHeight = Math.min(e.target.scrollHeight, 200);

        console.log(newHeight);
        
        // Set the new height
        e.target.style.height = `${newHeight}px`;
        
        // Update input text
        setInputtext(e.target.value);
    }

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    return (
        <div className="main-display-box h-full flex flex-col" data-gramm="false" data-gramm_editor="false">
            <div className="main-display-box-header p-2 text-sm flex justify-between">
                <div className="flex items-center gap-1">
                    <FaDisplay />
                    Chat
                </div>
                <button className="flex items-center gap-1 whiteboard-ask-button"
                    onClick={(e) => {
                        setMessages([]);
                        storage.clear();
                    }}
                >
                    <FaTrashCan />
                    <p>Clear</p>
                </button>
            </div>
            <div className="flex-grow pb-2 pl-2 pr-2 flex flex-col gap-2">
                <div className="messages-display flex flex-col gap-4 flex-grow h-40">
                    {messages.length > 0 ? (
                        messages.map((message, index) => (
                            <div key={index} className="text-sm flex flex-col">
                                {index % 2 === 0 ? (
                                    <div className="message-item items-center">
                                        {message}
                                    </div>) : (
                                    message === generationflag ? (
                                        <div className="generation-text">
                                            Generating...
                                        </div>
                                    ) : (
                                        <LLMOutputDisplay
                                            output={message}
                                            isNewMessage={index === messages.length - 1 && canEdit}
                                        />
                                    )
                                )}
                            </div>
                        ))) : (
                        <div className="h-full flex justify-center items-center flex-col">
                            <img
                                src={laptopLogo}
                                alt="Laptop Logo"
                                className="mb-4 leetbuddy-icon-shadow"
                                style={{ width: "150px", height: "auto" }}
                            />
                            <div className="greeting-text text-center text-xl">
                                Great to see you! <br /> How may I assist you today?
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="">
                    <div className="button-class">
                        <button className="button-group" onClick={(e) => { setInputtext("Can you give me some edge cases?") }}>Edge Cases</button>
                        <button className="button-group" onClick={(e) => { setInputtext("Can you analyze my time/space complexity?") }}>Complexity</button>
                        <button className="button-group" onClick={(e) => { setInputtext("Can I have a small hint to help me solve the problem?") }}>Hint</button>
                        <button className="button-group" onClick={(e) => { setInputtext("Can you help me debug my code?") }}>Bug</button>

                        {base64image && (
                            <button
                                className="button-group button-image-attachment"
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                                onClick={(e) => { setBase64image("") }}
                            >
                                {isHovered ? 'X' : '1 Attachment'}
                            </button>
                        )}

                    </div>

                    <form className="" onSubmit={handleSubmit}>
                        <div className="text-input w-full flex items-center relative flex-col">
                            <textarea
                                type="text"
                                className="chat-input-textbox w-full p-2 text-sm"
                                placeholder={canEdit ? "Ask LeetBuddy ✦" : "Generating Response..."}
                                onChange={(e) => setInputtext(e.target.value)}
                                value={inputtext}
                                maxLength="1000"
                                onInput={handleInput}
                                onKeyDown={handleKeyPress}
                                disabled={!canEdit}
                                spellCheck="false"
                                autoComplete="off"
                                data-gramm="false"
                                data-gramm_editor="false"
                            ></textarea>
                            <button type="submit" className="button-group2 inside-button">
                                ✦
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Chat;
