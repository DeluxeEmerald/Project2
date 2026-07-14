import { Container } from 'postcss';
import React, {useState} from 'react';
function Inventory()
{

    let _ud : any = localStorage.getItem('user_data');
    let ud = JSON.parse( _ud );
    let userId : string = ud.id;
    const [searchResults,setResults] = useState('');
    const [search,setSearchValue] = React.useState('');
    let isTrueSort = false;
    let isFilterOptions = false;

    const app_name = 'cop4331-89.xyz';
    function buildPath(route: string): string
    {
        if (import.meta.env.MODE != 'development')
        {
            return 'http://' + app_name + ':5000/' + route;
        }
        else
        {
            return 'http://localhost:5000/' + route;
        }
    }

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
            
            const container = document.getElementById('cardList');
            if (container) {
                container.innerHTML = '';

                _results.forEach((element: any) => {
                    const cardAdd = document.createElement('div');
                    cardAdd.className = 'card';
                    cardAdd.innerHTML = `
                        <img src="${element.imageUrl}" alt="${element.name}" class='h-60 w-40 rounded-md'>`;
                    container.appendChild(cardAdd);
                });
            }
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

    function showSort(){
        const container = document.getElementById('sortOption');
        if (container){
            if(!isTrueSort){
            container.innerHTML = '';
            container.className ='flex justify-center items-center';

            const list = document.createElement('form');
            list.className = 'flex flex-col gap-2 w-40 p-3 rounded-md';
            list.innerHTML = `
            <div class="flex items-center gap-1">
                <input type="radio" id="alphabet" name="sortOption" class="w-4 h-4">
                <label for="alphabet" class="text-sm whitespace-nowrap">Alphabet</label>
            </div>
            <div class="flex items-center gap-1">
                <input type="radio" id="manaCost" name="sortOption" class="w-4 h-4">
                <label for="manaCost" class="text-sm whitespace-nowrap">Mana Cost</label>
            </div>
            <div class="flex items-center gap-1">
                <input type="radio" id="rarity" name="sortOption" class="w-4 h-4">
                <label for="rarity" class="text-sm whitespace-nowrap">Rarity</label>
            </div>
            <div class="flex items-center gap-1">
                <input type="radio" id="color" name="sortOption" class="w-4 h-4">
                <label for="color" class="text-sm whitespace-nowrap">Color</label>
            </div>
            `;
            container.appendChild(list);
            isTrueSort = true;
            }
            else{
                container.innerHTML = '';
                isTrueSort = false;
            }
        }
    }

    function showFilterOptions(){
        const container = document.getElementById('filterOption');
        if (container){
            if(!isFilterOptions){
                container.className ='flex justify-center items-center';
            container.innerHTML = '';

            const list = document.createElement('form');
            list.className = 'grid grid-cols-2 gap-x-4 gap-y-2 w-56 p-3 rounded-md';
            list.innerHTML = `
            <div class="flex items-center gap-1">
                <input type="checkbox" id="creature" class="w-4 h-4">
                <label for="creature" class="text-sm">Creature</label>
            </div>
            <div class="flex items-center gap-1">
                <input type="checkbox" id="land" class="w-4 h-4">
                <label for="land" class="text-sm">Land</label>
            </div>
            <div class="flex items-center gap-1">
                <input type="checkbox" id="instant" class="w-4 h-4">
                <label for="instant" class="text-sm">Instant</label>
            </div>
            <div class="flex items-center gap-1">
                <input type="checkbox" id="sorcery" class="w-4 h-4">
                <label for="sorcery" class="text-sm">Sorcery</label>
            </div>
            <div class="flex items-center gap-1">
                <input type="checkbox" id="artifact" class="w-4 h-4">
                <label for="artifact" class="text-sm">Artifact</label>
            </div>
            <div class="flex items-center gap-1">
                <input type="checkbox" id="enchantment" class="w-4 h-4">
                <label for="enchantment" class="text-sm">Enchantment</label>
            </div>
            <div class="flex items-center gap-1">
                <input type="checkbox" id="planeswalker" class="w-4 h-4">
                <label for="planeswalker" class="text-sm">Planeswalker</label>
            </div>
            <div class="flex items-center gap-1">
                <input type="checkbox" id="common" class="w-4 h-4">
                <label for="common" class="text-sm">Common</label>
            </div>
            <div class="flex items-center gap-1">
                <input type="checkbox" id="uncommon" class="w-4 h-4">
                <label for="uncommon" class="text-sm">Uncommon</label>
            </div>
            <div class="flex items-center gap-1">
                <input type="checkbox" id="rare" class="w-4 h-4">
                <label for="rare" class="text-sm">Rare</label>
            </div>
            <div class="flex items-center gap-1">
                <input type="checkbox" id="mythic" class="w-4 h-4">
                <label for="mythic" class="text-sm">Mythic</label>
            </div>
            <button type="button" class="col-span-2 mx-auto mt-2 px-4 py-1 bg-white rounded-full">Submit</button>
            `;
            container.appendChild(list);
            isFilterOptions = true;
            }
            else{
                container.innerHTML = '';
                isFilterOptions = false;
            }
        }
    }

    
    return(
    <div id="cardUIDiv" className='rounded-3xl w-full flex items-center justify-center flex-col text-black gap-4 font-grover'>
        <p className='text-black text-xl'>Inventory</p>
            <div>
            Search: <input type="text" id="searchText" placeholder="Card To Search For" onChange={handleSearchTextChange} 
            className='bg-white' />
            <button type="button" id="searchCardButton" className="bg-main rounded-full w-32 ml-4"
                onClick={searchCard}> Search Card</button>
        </div>

        <div className='flex flex-col items-center gap-2'>
            <div>
                <button type="button" id="Sort" className="bg-main w-32"
                    onClick={showSort}> Sort</button>   
                <button type="button" id="Filter" className="bg-main w-32"
                    onClick={showFilterOptions}> Filter</button>
            </div>

            <div className='flex flex-row gap-2'>
                <div id='sortOption' className=''></div>   
                <div id='filterOption' className=''></div>
            </div>
        </div>
        <span id="cardSearchResult">{searchResults}</span>
        <p id="cardList" className='flex flex-wrap gap-2 justify-center' ></p>
    </div>
    );
}
export default Inventory;