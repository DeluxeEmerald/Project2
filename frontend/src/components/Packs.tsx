import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { buildPath} from './Path';

function Packs()
{

    let _ud : any = localStorage.getItem('user_data');
    let ud = JSON.parse( _ud );
    let userId : string = ud.id;
    // let firstName : string = ud.firstName;
    // let lastName : string = ud.lastName;
    const [message,setMessage] = useState('');
    const [searchResults,setResults] = useState('');
    const [cardList,setCardList] = useState('');
    const [search,setSearchValue] = React.useState('');
    const [card,setCardNameValue] = React.useState('');

    async function addCard(e:any) : Promise<void>
    {
        e.preventDefault();
        let obj = {userId:userId,card:card};
        let js = JSON.stringify(obj);
        try
        {
            const response = await fetch(buildPath('api/addCard'),
            {method:'POST',body:js,headers:{'Content-Type':
            'application/json'}});
            
            let txt = await response.text();
            let res = JSON.parse(txt);
            
            if( res.error.length > 0 )
            {
                setMessage( "API Error:" + res.error );
            }
            else
            {
                setMessage('Card has been added');
            }
        }
        catch(error:any)
        {
            setMessage(error.toString());
        }
    };

    async function searchCard(e:any) : Promise<void>
    {
        e.preventDefault();
        let obj = {userId:userId,search:search};
        let js = JSON.stringify(obj);
        
        try
        {
            const response = await fetch(buildPath('api/searchCards'),
            {method:'POST',body:js,headers:{'Content-Type':
            'application/json'}});
            
            let txt = await response.text();
            let res = JSON.parse(txt);
            let _results = res.results;
            let resultText = '';
            
            for( let i=0; i<_results.length; i++ )
            {
                resultText += _results[i];
                if( i < _results.length - 1 )
                {
                    resultText += ', ';
                }
            }
            setResults('Card(s) have been retrieved');
            setCardList(resultText);
        }
        catch(error:any)
        {
            alert(error.toString());
            setResults(error.toString());
        }
    };

    function handleSearchTextChange( e: any ) : void
    {
        setSearchValue( e.target.value );
    }
    
    function handleCardTextChange( e: any ) : void
    {
        setCardNameValue( e.target.value );
    }

    function toPackOpening() {
        navigate('/openpack');
    }

    
    return(
    <div id="cardUIDiv" className='rounded-3xl w-full flex flex-col items-center justify-center'>
            <h1 style={{ marginTop:"100px" }}>March of the Machine Epilogue Booster Pack</h1>
            <img style={{ maxWidth: '20%' }} src='src/assets/pack.png' alt="March of the Machine Epilogue Booster Pack"></img>
            <button type="button" id="logoutButton" className="buttons" style={{ marginTop:"10px", marginBottom:"150px" }} onClick={()=>toPackOpening()}> Open Pack </button>
    </div>
    );
}
export default Packs;