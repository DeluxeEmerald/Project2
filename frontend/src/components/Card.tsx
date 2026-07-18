import React, {useEffect, useState} from 'react';
import { buildPath} from './Path';
import { retrieveToken, storeToken, retrieveUserID, storeUserID } from '../tokenStorage';
import { useNavigate } from 'react-router-dom';

function Card()
{
return(
    <div id="cardUIDiv" className='rounded-3xl w-full flex-col items-center justify-center'>
        card
    </div>
    );
}
export default Card;

//