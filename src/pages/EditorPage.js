import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import ACTIONS from '../Actions';
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import {
    useLocation,
    useNavigate,
    Navigate,
    useParams,
} from 'react-router-dom';
import axios from 'axios'
import { Button } from '@mui/material';
import { Textarea } from '@mui/joy';




const EditorPage = () => {
    const [output, setOutput] = useState("");
    const socketRef = useRef(null);
    const programRef = useRef(null);
    const codeRef = useRef(null);
    const location = useLocation();
    const { roomId } = useParams();
    const reactNavigator = useNavigate();
    const [clients, setClients] = useState([]);
    const number = clients.length;
    const [inputParameters, setInputParameters] = useState();
    const [program, setProgram] = useState();

    function handleInputParameters(e) {
        setInputParameters(e.target.value);
    }

    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket();
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));

            function handleErrors(e) {
                console.log('socket error', e);
                toast.error('Socket connection failed, try again later.');
                reactNavigator('/');
            }

            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                username: location.state?.username,
            });

            // Listening for joined event
            socketRef.current.on(
                ACTIONS.JOINED,
                ({ clients, username, socketId }) => {
                    if (username !== location.state?.username) {
                        toast.success(`${username} joined the room.`);
                        console.log(`${username} joined`);
                    }
                    setClients(clients);
                    // setProgram(codeRef.current);
                    socketRef.current.emit(ACTIONS.SYNC_CODE, {
                        code: codeRef.current,
                        socketId,
                    });
                }
            );

            // Listening for disconnected
            socketRef.current.on(
                ACTIONS.DISCONNECTED,
                ({ socketId, username }) => {
                    toast.success(`${username} left the room.`);
                    setClients((prev) => {
                        return prev.filter(
                            (client) => client.socketId !== socketId
                        );
                    });
                }
            );
        };
        init();
        // return () => {
        //     socketRef.current.disconnect();
        //     socketRef.current.off(ACTIONS.JOINED);
        //     socketRef.current.off(ACTIONS.DISCONNECTED);
        // };
    }, []);

    async function handleRun() {
        // console.log(data)
        const response = await axios({
            method: 'post',
            url: 'http://localhost:5000/run',
            data: {
                language: "c",
                code: codeRef.current,
                input_params:inputParameters
            }
        })
        console.log(await response)
        console.log(response.data.output);
        setOutput(response.data.output)

    }


    async function copyRoomId() {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID has been copied to your clipboard');
        } catch (err) {
            toast.error('Could not copy the Room ID');
            console.error(err);
        }
    }

    function leaveRoom() {
        reactNavigator('/');
    }

    if (!location.state) {
        return <Navigate to="/" />;
    }

    return (
        <div className="grid grid-cols-4 gap-0">
            <div className="col-span-1 h-screen relative">
                <div className="">
                    <div className="font-serif text-2xl fw-bolder text-center p-1">
                        <h2>Let's code together</h2>
                    </div>
                    <div className='font-serif text-lg p-1'>
                        <h3>Connected clients ({number})</h3>
                    </div>
                    <div className="block justify-start">
                        {clients.map((client) => (
                            <Client
                                key={client.socketId}
                                username={client.username}
                            />
                        ))}
                    </div>
                </div>

                <div className="block container text-center absolute bottom-0">
                    <Button variant='contained' onClick={() => { handleRun() }} sx={{ margin: '5px', padding: '5px', width: "90%" }} >
                        Run Code
                    </Button>
                    <Button variant='contained' onClick={copyRoomId} sx={{ margin: '5px', padding: '5px', width: "90%" }} >
                        Copy ROOM ID
                    </Button>
                    <Button variant='contained' onClick={leaveRoom} sx={{ margin: '5px', padding: '5px', width: "90%" }} >
                        Leave
                    </Button>
                </div>

            </div>
            <div className="col-span-3 h-screen relative">
                <div>
                    <Editor
                        socketRef={socketRef}
                        roomId={roomId}
                        onCodeChange={(code) => {
                            codeRef.current = code;
                        }}
                    />
                </div>
                <div className='absolute bottom-0 container'>
                    <div className='my-1'>
                        <Textarea minRows={5} placeholder='Input parameters like this : 1 2 3 4' sx={{ borderRadius: '0px' }} onChange={(e) => { handleInputParameters(e) }} />
                    </div>
                    <div className="my-1">
                        <Textarea minRows={5} value={output} placeholder='Output' sx={{ borderRadius: '0px' }} readOnly="true" />
                    </div>
                </div>
            </div>

        </div>
    );
};

export default EditorPage;
