import {useEffect, useRef, useState} from 'react';
import { buildPath} from './Path';
import { retrieveToken, storeToken, retrieveUserID } from '../tokenStorage';
import { useNavigate } from 'react-router-dom';
import cardStack from '../assets/cardStack.png';

function Decks()
{

    // let firstName : string = ud.firstName;
    // let lastName : string = ud.lastName;
    const [message,setMessage] = useState('');
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
        div.className = 'rounded-2xl m-4 flex items-center justify-center';
        div.classList.add(classNames);

        const button: HTMLButtonElement = document.createElement('button');
        button.className = 'flex flex-col items-center gap-3 p-2 w-40';
        button.onclick = () => deck ? toDeckDetails(deck) : toDeckAdd();

        const image = document.createElement('img');
        image.src = cardStack;
        image.alt = text;
        image.className = 'w-32 h-48 object-contain';

        const label = document.createElement('span');
        label.textContent = text;
        label.className = 'text-center text-sm font-semibold text-white';

        button.appendChild(image);
        button.appendChild(label);

        div.appendChild(button);

        // div.textContent = text;
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
            setMessage(error.toString());
        }
    };

    const loadDecks = async (e: any): Promise<void> => {
        try {
            await getDecks(e);
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
        {message && <p className='text-center text-red-600'>{message}</p>}
        <div id="decksContainer" className='flex flex-wrap justify-center items-start'></div>
    </div>
    );
}
export default Decks;