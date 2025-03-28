"use client";
 
import React from 'react';
import LostItemsList from './LostItemsList';

const HomePage: React.FC = () => {
    return(
        <div className="flex flex-col bg-[#f5f5f5] w-full">
            <div className="flex flex-col mt-16 mb-16 mx-4 lg:mx-10 rounded-lg py-10 px-4 py-10 lg:px-10">
                <LostItemsList />
            </div>
        </div>
    );
};

export default HomePage;