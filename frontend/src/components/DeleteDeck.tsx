import { useNavigate } from 'react-router-dom';
import { retrieveToken } from '../tokenStorage';
import { buildPath } from "./Path";
import { useState } from "react";

function RemoveDeck({deckId} : {deckId : string})
{
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    async function doDelete() : Promise<void>
        {
            confirm("Are you sure you want to delete this deck?");
            var obj = {jwtToken: retrieveToken(), deckId: deckId};
            var js = JSON.stringify(obj);            
            try
            {
                const response = await fetch(buildPath('api/removedeck'),
                {method:'POST',body:js,headers:{'Content-Type':
                'application/json'}});
                
                var res = JSON.parse(await response.text());
                
                if( res.error && res.error.length > 0 )
                {
                    setMessage(res.error);
                }
                else
                {
                    navigate('/deckdelete');
                }
            }
            catch(error:any)
            {
                setMessage(error.toString());
                return;
            }         
        };
    
    return(
    <div id="cardUIDiv" className='rounded-3xl w-full flex flex-col items-center 
        justify-center font-grover text-black'>
            <button id="deleteDeck" className="mt-5 mb-10 w-48 h-8 rounded-full 
                bg-wood hover:bg-main hover:text-white border-2 border-black" onClick={()=>doDelete()}>Delete Deck</button>
            <p className="text-black mb-4">{message}</p>
    </div>
    );
}
export default RemoveDeck;