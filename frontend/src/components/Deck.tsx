import React, {useEffect, useState} from 'react';
import { buildPath} from './Path';
import { retrieveToken, storeToken, retrieveUserID, storeUserID } from '../tokenStorage';
import { useNavigate } from 'react-router-dom';

function Decks()
{
return(
    <div id="cardUIDiv" className='rounded-3xl w-full flex-col items-center justify-center'>
        deck
    </div>
    );
}
export default Decks;

//