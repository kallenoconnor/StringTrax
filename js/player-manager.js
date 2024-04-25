//@ts-check

/** @typedef { {Register:(handler:()=>void)=>void, StopAll:(butNot?:()=>void)=>void, functions:(()=>void)[]} } PlayerManager*/

/** @type {PlayerManager} */
const Players =
{
    functions: [],
    Register(handler){Players.functions.push(handler)},
    StopAll(butNot)
    {
        Players.functions.forEach(f=> f !== butNot ? f() : null );
    }
};

export default Players;
