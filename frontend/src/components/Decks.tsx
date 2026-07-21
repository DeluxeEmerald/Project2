import React, {useEffect, useRef, useState} from 'react';
import { buildPath} from './Path';
import { retrieveToken, storeToken, retrieveUserID } from '../tokenStorage';
import { useNavigate } from 'react-router-dom';

function Decks()
{
    const [message,setMessage] = useState('');
    const [searchResults,setResults] = useState('');
    const [card,setCardNameValue] = React.useState('');
        const hasLoaded = useRef(false);

    const navigate = useNavigate();

    function toDeckDetails(deck: any) {
        navigate(`/deckdetails/${deck.id}`, { state: { deck:deck } });
    }

    function toDeckAdd() {
        navigate(`/createdeck`);
    }

    function createNewDeckDiv(deck:any, text:string, classNames:string) : HTMLDivElement {
        const div = document.createElement('div');
        div.className = 'rounded-2xl m-4 border-5 bg-black flex items-center justify-center';
        div.classList.add(classNames);

        const button: HTMLButtonElement = document.createElement('button');
        button.textContent = text;
        button.className = 'flex-1 w-32 h-48'
        button.onclick = () => deck ? toDeckDetails(deck) : toDeckAdd();

        div.appendChild(button);

        return div;
    }

    async function getDecks(e:any) : Promise<void>
    {
        if (e) e.preventDefault();
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
                const div = createNewDeckDiv(element, element.deckName, "deckDiv");
                container?.appendChild(div);
            });

            const div = createNewDeckDiv(null, "Add new deck", "deckDiv");
            container?.appendChild(div);
        }
        catch(error:any)
        {
            setResults(error.toString());
        }
    };

    const loadDecks = async (e: any): Promise<void> => {
        try {
            const result = await getDecks(e);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        if (hasLoaded.current) return;
        hasLoaded.current = true;
        loadDecks(null);
    }, []);
    
    return(
    <div id="cardUIDiv" className='rounded-3xl w-full flex-col items-center justify-center'>
        <div id="decksContainer" className='flex justify-center items-center'></div>
    </div>
    );
}
export default Decks;