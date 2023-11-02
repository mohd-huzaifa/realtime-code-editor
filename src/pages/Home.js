import React, { useState } from 'react';
import { v4 as uuidV4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { TextField, Button } from '@mui/material'

const Home = () => {
    const navigate = useNavigate();

    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');
    const createNewRoom = (e) => {
        e.preventDefault();
        const id = uuidV4();
        setRoomId(id);
        toast.success('Created a new room');
    };

    const joinRoom = () => {
        if (!roomId || !username) {
            toast.error('ROOM ID & username is required');
            return;
        }

        // Redirect
        navigate(`/editor/${roomId}`, {
            state: {
                username,
            },
        });
    };

    const handleInputEnter = (e) => {
        if (e.code === 'Enter') {
            joinRoom();
        }
    };
    return (
        <div className="container flex h-screen justify-center items-center ">
            <div className="w-96 p-1 shadow rounded">
                <div className="text-center font-serif text-2xl fw-bolder">
                    <h2> Hello coder</h2>
                </div>
                {/* <img
                    className="homePageLogo"
                    src="/code-sync.png"
                    alt="code-sync-logo"
                /> */}
                <div>
                    <h4 className="font-serif text-lg my-1 py-1">Paste invitation room id</h4>
                </div>
                <div className="inputGroup">
                    <TextField id="room_id" label="ROOM ID" variant="outlined"
                        placeholder="ROOM ID"
                        onChange={(e) => setRoomId(e.target.value)}
                        value={roomId}
                        onKeyUp={handleInputEnter}
                        sx={{ marginY: '5px' }}
                        size='small'
                    />

                    <TextField id="username" label="USERNAME" variant="outlined"
                        placeholder="USERNAME"
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                        onKeyUp={handleInputEnter}
                        sx={{ marginY: '5px' }}
                        size='small'
                    />
                    <Button variant="contained"
                        onClick={joinRoom}
                    >JOIN</Button>
                    <span className="createInfo font-serif text-sm ">
                        If you don't have an invite then create &nbsp;
                        <a
                            onClick={createNewRoom}
                            href="#"
                            className="createNewBtn"
                        >
                            new room
                        </a>
                    </span>
                </div>
            </div>
            <footer className=' container font-serif mx-auto p-2 text-center'>
                <h4 className=''>
                    If you want to get more information go to my github account
                    <a href="https://github.com/mohd-huzaifa/">  Link</a>
                </h4>
            </footer>
        </div>
    );
};

export default Home;
