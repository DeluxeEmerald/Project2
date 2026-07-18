import React, {useEffect, useState} from 'react';
import { buildPath} from './Path';
import { retrieveToken, storeToken, retrieveUserID, storeUserID } from '../tokenStorage';
import { useNavigate } from 'react-router-dom';

function Decks()
{

    // let firstName : string = ud.firstName;
    // let lastName : string = ud.lastName;
    const [message,setMessage] = useState('');
    const [searchResults,setResults] = useState('');
    const [cardList,setCardList] = useState('');
    const [card,setCardNameValue] = React.useState('');

    const navigate = useNavigate();

    function createNewDeckDiv(text:string, classNames:string) : HTMLDivElement {
        const div = document.createElement('div');
        div.className = 'rounded-2xl m-4 border-5 bg-black flex items-center justify-center';
        div.classList.add(classNames);

        const button: HTMLButtonElement = document.createElement('button');
        button.textContent = text;
        button.className = 'flex-1 w-32 h-48'
        button.onclick = () => navigate('/deckinfo');

        div.appendChild(button);

        // div.textContent = text;
        return div;
    }

    async function getDecks(e:any) : Promise<void>
    {
        e.preventDefault();
        let obj = {jwtToken: retrieveToken(), userId: JSON.parse(retrieveUserID()).id};
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

            let results = res.results;
            
            const container = document.getElementById("decksContainer");

            if (container) container.innerHTML = '';
            results.forEach((element: any) => {
                const div = createNewDeckDiv(element.deckName, "deckDiv");
                container?.appendChild(div);
            });

            const div = createNewDeckDiv("Add new deck", "deckDiv");
            container?.appendChild(div);
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
    <div id="cardUIDiv" className='rounded-3xl w-full flex-col items-center justify-center'>
        <button className='rounded-2xl w-32 h-16 m-4 border-5 bg-black' onClick={loadDecks}>Get Decks</button>
        <div id="decksContainer" className='flex justify-center items-center'></div>
    </div>
    );
}
export default Decks;