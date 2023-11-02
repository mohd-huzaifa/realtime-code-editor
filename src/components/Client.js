import React from 'react';
import Avatar from 'react-avatar';

const Client = ({ username }) => {
    return (
        <div className="flex m-1">
            <Avatar name={username} size={50} round="50%" />
            <span className="font-serif my-auto text-lg mx-2">{username}</span>
        </div>
    );
};

export default Client;
