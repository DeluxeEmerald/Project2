import { retrieveToken, retrieveUserID } from '../tokenStorage';
import { buildPath } from "./Path";
import { useState } from "react";
import { Navigate, useNavigate } from 'react-router-dom';

function CreateDeck()
{
    let _ud : any = retrieveUserID();
    let ud = JSON.parse( _ud );
    let userId : string = ud.id;
    const [message, setMessage] = useState('');
    const navigate = useNavigate();


    async function createDeck() : Promise<void>
        {            
            const deckName = (document.getElementById("deckName") as HTMLInputElement)?.value || '';
            
            var obj = {jwtToken: retrieveToken(), userId: userId, deckName: deckName, public: 0};
            var js = JSON.stringify(obj);
            
            try
            {
                const response = await fetch(buildPath('api/createdeck'),
                {method:'POST',body:js,headers:{'Content-Type':
                'application/json'}});
                
                var res = JSON.parse(await response.text());
                
                if( res.error && res.error.length > 0 )
                {
                    setMessage(res.error);
                }
                else
                {
                    setMessage("Deck Created");
                }
            }
            catch(error:any)
            {
                setMessage(error.toString());
                return;
            }         
        };

    function toDecks(){
        navigate('/decks');
    }
    
    return(
    <div id="cardUIDiv" className='rounded-3xl w-full flex flex-col items-center justify-center font-grover text-black'>
            <h1 className="text-black text-xl font-grover mt-3">Create a deck</h1>
            <div className="flex flex-row gap-3 m-4 justify-center">
                <p>Deck Name:</p>
                <input type="text" id="deckName" 
                placeholder="Deck Name" className="bg-white"></input>
            </div>
            <div className='flex flex-row gap-3'>
                <button id="createDeck" className="mt-5 mb-10 w-48 rounded-full bg-main hover:bg-white"
                onClick={()=>toDecks()}>Back</button>
                <button id="createDeck" className="mt-5 mb-10 w-48 rounded-full bg-white hover:bg-main"
                onClick={()=>createDeck()}> Create Deck</button>
            </div>
            <p className="text-black mb-4">{message}</p>
    </div>
    );
}
export default CreateDeck;