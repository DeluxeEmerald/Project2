import React, {useEffect, useState} from 'react';
import { buildPath} from './Path';
import { retrieveToken, storeToken, retrieveUserID, storeUserID } from '../tokenStorage';

function Decks()
{

    // let firstName : string = ud.firstName;
    // let lastName : string = ud.lastName;
    const [message,setMessage] = useState('');
    const [searchResults,setResults] = useState('');
    const [cardList,setCardList] = useState('');
    const [card,setCardNameValue] = React.useState('');

    async function getDecks(e:any) : Promise<void>
    {
        e.preventDefault();
        let obj = {jwtToken: retrieveToken(), userid: JSON.parse(retrieveUserID()).id};
        let js = JSON.stringify(obj);
        
        try
        {
            const response = await fetch(buildPath('api/getdecks'),
            {method:'POST',body:js,headers:{'Content-Type':
            'application/json'}});
            
            let txt = await response.text();
            let res = JSON.parse(txt);
            if(res.error && res.error.length > 0){
                setMessage(res.error);
            }
            else{
                storeToken(res.jwtToken);
            }

            let results = res._ret;
                        
        }
        catch(error:any)
        {
            setResults(error.toString());
        }
    };
    
    function handleCardTextChange( e: any ) : void
    {
        setCardNameValue( e.target.value );
    }

    const loadDecks = async (e: any): Promise<void> => {
        try {
            const result = await getDecks(e);
        } catch (err) {
            console.log(err);
        }
    };
    
    return(
    <div id="cardUIDiv" className='rounded-3xl w-full flex items-center justify-center'>
        <button className='rounded-2xl w-32 h-16 m-4 border-5 bg-black' onClick={loadDecks}>Get Decks</button>
    </div>
    );
}
export default Decks;

//<div className='rounded-2xl w-32 h-48 m-4 border-5 bg-black'></div>