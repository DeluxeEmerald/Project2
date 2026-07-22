import {useEffect, useRef} from 'react';
import { buildPath} from './Path';
import { retrieveToken, storeToken, retrieveUserID } from '../tokenStorage';
import { useNavigate } from 'react-router-dom';
import deckImage from '../assets/deckImage.png';
import deckAddImage from '../assets/deckAddImage.png';

function Decks()
{
    const hasLoaded = useRef(false);

    const navigate = useNavigate();

    function toDeckDetails(deck: any) {
        navigate(`/deckdetails/${deck.id}`, { state: { deck:deck } });
    }

    function toDeckAdd() {
        navigate(`/createdeck`)
    }

function createNewDeckDiv(deck: any, text: string, classNames: string): HTMLDivElement {
    const div = document.createElement('div');
    div.className = 'm-[25px] flex flex-col items-center w-32 h-80';

    const imageDiv = document.createElement('div');
    imageDiv.className = 'w-32 h-64 flex flex-col items-center justify-center bg-cover bg-center shrink-0';
    if (deck)
        imageDiv.style.backgroundImage = `url(${deckImage})`;
    else
        imageDiv.style.backgroundImage = `url(${deckAddImage})`;
    // classNames may contain multiple space-separated classes;
    // classList.add() can't take a single multi-class string, so split it
    classNames.split(' ').filter(Boolean).forEach(cls => imageDiv.classList.add(cls));

    const button: HTMLButtonElement = document.createElement('button');
    button.className = 'flex-1 w-32 h-64';
    button.onclick = () => (deck ? toDeckDetails(deck) : toDeckAdd());
    imageDiv.appendChild(button);

    const textDiv = document.createElement('div');
    textDiv.textContent = text;
    // Fixed-height slot: same space reserved regardless of line count,
    // clamps to 2 lines and ellipsizes anything longer
    textDiv.className =
        'w-32 h-12 flex items-center justify-center text-center text-sm leading-tight ' +
        'overflow-hidden line-clamp-2 shrink-0';

    div.appendChild(imageDiv);
    div.appendChild(textDiv);

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
                console.log(res.error);
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
            console.log(error.toString());
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
        <div id="decksContainer" className='flex justify-center items-center'></div>
    </div>
    );
}
export default Decks;