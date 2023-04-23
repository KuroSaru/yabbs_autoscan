/** @param {NS} ns */

function humanize(monies) 
{
    var s = ['k', 'M', 'B', 't', 'q', 'Q', 's', 'S'];
    var e = Math.floor(Math.log(monies) / Math.log(1000));
    return ( monies > 0 ) ? (monies / Math.pow( 1000, e)).toFixed(2) + "" + s[e] : monies;
}

function printToTerm(data, clearTerm=true)
{
    if (clearTerm)
    {
        eval("document.getElementById('terminal').innerHTML='';");
    }
    eval("document.getElementById('terminal').insertAdjacentHTML('beforeend','"+data+"')");
}

function CurrentPortToolsLevel(ns)
{
    let Level = ns.fileExists("BruteSSH.exe", "home")?1:0;
        Level += ns.fileExists("FTPCrack.exe", "home")?1:0;
        Level += ns.fileExists("relaySMTP.exe", "home")?1:0;
        Level += ns.fileExists("HTTPWorm.exe", "home")?1:0;
        Level += ns.fileExists("SQLInject.exe", "home")?1:0;
    return Level;
}

function hexToRgb( hex )
{
  return hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i ,(m, r, g, b) => '#' + r + r + g + g + b + b)
    .substring(1).match(/.{2}/g)
    .map(x => parseInt(x, 16))
}

function rgbToHex( rgb ) 
{
  return "#" + (1 << 24 | rgb[0] << 16 | rgb[1] << 8 | rgb[2]).toString(16).slice(1);
}

function GenHexGradiant(c1, c2, weight) {
    let color1 = hexToRgb(c1);
    let color2 = hexToRgb(c2);
    let p = weight;
    let w = p * 2 - 1;
    let w1 = (w/1+1) / 2;
    let w2 = 1 - w1;
    let rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
        Math.round(color1[1] * w1 + color2[1] * w2),
        Math.round(color1[2] * w1 + color2[2] * w2)];
    return rgbToHex(rgb);
}

export function GenServerStats( ns, target_ , depth_)
{
    let Stats = {
        hasRootAccess: ns.hasRootAccess( target_ ) ,
        ServerMoneyMax: ns.getServerMaxMoney( target_ ),
        ServerMoneyAva: ns.getServerMoneyAvailable( target_ ),
        ServerMoneyMaxHuman: humanize( ns.getServerMaxMoney( target_ ) ),
        ServerMoneyAvaHuman: humanize( ns.getServerMoneyAvailable( target_ ) ),
        NukePorts: ns.getServerNumPortsRequired( target_ ),
        MaxRam: ns.getServerMaxRam( target_ ),
        UsedRam: ns.getServerUsedRam( target_ ),
        MinSecLevel: ns.getServerMinSecurityLevel( target_ ),
        SecLevel: ns.getServerSecurityLevel( target_ ),
        ReqHackingLevel: ns.getServerRequiredHackingLevel( target_ ),
        Depth: depth_,
        Name: target_
    }
    return Stats;
}

export function GenTableRow( targetStats, CurrHackLevel, CurrPortToolsLevel )
{
    const BabyBlue = "#89CFF0";
    const LightRed = '#FAA0A0';
    const BabyGreen =  '#8CFF9E';
    const LightGrey = '#c0c0c0';
    const BabyOrange = '#FFD580';

    let MoneyColor = BabyBlue;
    if (targetStats.ServerMoneyMax > 0)
    {
        MoneyColor = GenHexGradiant( BabyGreen , LightRed , ( ( targetStats.ServerMoneyAva / targetStats.ServerMoneyMax ) ) );
    }

    let MoneyText = `<a style="color:yellow">🪙</a> <a style="color:${MoneyColor}">${humanize( targetStats.ServerMoneyAva )} </a><a style="color:${LightGrey}">/ ${humanize( targetStats.ServerMoneyMax )}</a>`;
    
    let hackableSymbol = "";
    let hackhover = "";
    if ( targetStats.hasRootAccess )
    {
        hackableSymbol = `<a style="color:${BabyGreen}">✔</a>`;
        hackhover = `---------------&#10;✔ HasRoot. &#10;---------------&#10;`;
    }
    else 
    {
        if ( (CurrHackLevel >= targetStats.ReqHackingLevel) && ( CurrPortToolsLevel >= targetStats.NukePorts ) )
        {
            hackableSymbol = `<a style="color:${BabyOrange}">⚔</a>`;
            hackhover = `---------------&#10;⚔ Rootable! &#10;---------------&#10;`;
        }
        else
        {
            hackableSymbol = `<a style="color:${LightRed}">🛡</a>`;
            hackhover = `---------------&#10;🛡 UnRootable! &#10;---------------&#10;`;
        }
    }

    let hoverText = `${hackhover} Req Level: ${targetStats.ReqHackingLevel} &#10;Req Ports: ${targetStats.NukePorts} &#10;Security: ${targetStats.SecLevel} / ${targetStats.MinSecLevel} `;

    let hackable = `<a style="color:${LightRed};font-weight:bold">${hackableSymbol}</a>`;
    
    let Output = "&emsp;".repeat( ( targetStats.Depth ) ) ;

    Output += `${hackable} <a style="color:${LightGrey};font-weight:bold" title="${hoverText}">${targetStats.Name}</a> - <a style="color:${LightGrey}">[</a>${MoneyText}<a style="color:${LightGrey}"> ]</a> </br>`;

    return Output;
}

export async function main(ns) 
{
    let CurrHackLevel = ns.getHackingLevel();
    let CurrPortToolsLevel = CurrentPortToolsLevel(ns);
    let SelfStats = GenServerStats(ns, ns.getHostname(), 0); 
    let output = "";

    while(true)
    {
        ns.printf("[🟩][ "+ SelfStats.Name+" ] Sleeping.... 5secs" );
        await ns.sleep(5000);
        ns.printf("[🟩][ "+ SelfStats.Name+" ] Waking up..." );

        if ( (ns.args.length == 0) ) //Display or Profit
        {

            if (ns.getHostname() == "home") //Display Mode
            {
                const maxScanDepth = 99;
                output = "<a style =\"color:white\"> Network: </a></b></br>";
                for ( const server of listServers(ns, maxScanDepth) )
                { 
                    let targetStats = GenServerStats( ns, server.name, server.depth );
                    output += GenTableRow( targetStats, CurrHackLevel, CurrPortToolsLevel );
                }
                output += "";
                printToTerm( output );
                ns.exit();
            }
            else //Profit mode
            {
                if ( SelfStats.hasRootAccess )
                {
                    
                    if ( SelfStats.SecLevel > SelfStats.MinSecLevel )
                    {
                        await ns.weaken( SelfStats.Name );
                    }
                    else if ( SelfStats.ServerMoneyAva < (SelfStats.ServerMoneyMax*0.50) )
                    {
                        await ns.grow( SelfStats.Name );
                    }
                    else
                    {
                        await ns.hack( SelfStats.Name );
                    }

                    output = `🔶 ${ SelfStats.Name } :: Grown/Weakened or Hacked`;
                    ns.printf(output);
                    //printToTerm( output );
                }
                else
                {
                    if ( CurrPortToolsLevel >= SelfStats.NukePorts )
                    {
                        OpenPorts( ns, SelfStats.Name, SelfStats.NukePorts );
                        await ns.nuke( SelfStats.Name );
                        output = `✅ ${ SelfStats.Name } :: Ports Opened & Rooted`;
                        ns.printf(output);
                        //printToTerm( output );
                    }
                    else
                    {
                        output = `❌ ${ SelfStats.Name } :: Unable to Open Ports`;
                        ns.printf(output);
                        //printToTerm( output );
                    }
                    
                }

            }
        }
        else if ( ns.args[0] == "w" ) //Worm Mode
        {
            let neededRam = ns.getScriptRam( 'autoscan.js' , SelfStats.Name );

            ns.printf("[🟩][ "+ SelfStats.Name+" ] Worm Mode Started. (using: "+neededRam+"GB)" );
        
            //Get List Deep 1;
            let neighbors = await ns.scan();
            for ( const neighbor of neighbors )
            {
                await ns.sleep(100);
                let neighborStats = GenServerStats( ns, neighbor, 0 );
                if ( !neighborStats.hasRootAccess )
                {
                    ns.printf("[🔶][ "+ SelfStats.Name+" ] Neighbor ( "+neighborStats.Name+" ) Detected.");

                    if ( ( CurrPortToolsLevel >= neighborStats.NukePorts ) && ( CurrHackLevel >= neighborStats.ReqHackingLevel ) )
                    {
                        ns.printf("[🔷][ "+ SelfStats.Name+" ] Opening Ports on ( "+neighborStats.Name+" )." );
                        OpenPorts( ns, neighborStats.Name, neighborStats.NukePorts );
                        ns.printf("[🔷][ "+ SelfStats.Name+" ] Rooting ( "+neighborStats.Name+" )." );
                        await ns.nuke( neighborStats.Name );

                    //Copy Script to Machine and Run.
                    ns.printf("[🔷][ "+ SelfStats.Name+" ] Copying autoscan.js + tools to ( "+neighborStats.Name+" )." );
                    await ns.scp( "autoscan.js", neighborStats.Name );
                
                    let maxThreads = Math.floor( neededRam / neighborStats.MaxRam );
                    let halfThreads = (maxThreads / 2) < 1 ? 1 : Math.floor(maxThreads / 2);
                    ns.printf( neededRam+ ' / ' + maxThreads+ ' / ' + halfThreads + ' / ' + neighborStats.MaxRam );

                    if ( await ns.scriptRunning('autoscan.js' , neighborStats.Name ) ) 
                    {
                        await ns.scriptKill('autoscan.js' , neighborStats.Name )
                    }
                    
                    ns.printf("[🔷][ "+ SelfStats.Name+" ] Spawning autoscan.js for Profit ( "+neighborStats.Name+" ) - [ "+(halfThreads)+" ]");
                    await ns.exec( 'autoscan.js' , neighborStats.Name , halfThreads );

                    ns.printf("[🔷][ "+ SelfStats.Name+" ] Spawning autoscan.js as Worm ( "+neighborStats.Name+" ) - [ "+(halfThreads)+" ]");
                    await ns.exec( 'autoscan.js' , neighborStats.Name , halfThreads , 'w');

                    }
                    else
                    {
                        ns.printf("[🔶][ "+ SelfStats.Name+" ] Skipping ( "+neighborStats.Name+" ) Unhackable."); 
                    }
                }
                else
                {
                    if (( neighborStats.hasRootAccess ) && (neighborStats.MaxRam > 0))
                    {
                        if ( await ns.scriptRunning('autoscan.js' , neighborStats.Name ) == false ) 
                        {
                        //Copy Script to Machine and Run.
                        ns.printf("[🔷][ "+ SelfStats.Name+" ] Copying autoscan.js + tools to ( "+neighborStats.Name+" )." );
                        await ns.scp( "autoscan.js", neighborStats.Name );
                    
                        let maxThreads = Math.floor( neededRam / neighborStats.MaxRam );
                        let halfThreads = (maxThreads / 2) < 1 ? 1 : Math.floor(maxThreads / 2);
                        
                        ns.printf("[🔷][ "+ SelfStats.Name+" ] Spawning autoscan.js for Profit ( "+neighborStats.Name+" ) - [ "+(halfThreads)+" ]");
                        await ns.exec( 'autoscan.js' , neighborStats.Name , halfThreads );
                        
                        ns.printf("[🔷][ "+ SelfStats.Name+" ] Spawning autoscan.js as Worm ( "+neighborStats.Name+" ) - [ "+(halfThreads)+" ]");
                        await ns.exec( 'autoscan.js' , neighborStats.Name , halfThreads , 'w');
                        }
                    }
                    else 
                    {
                        ns.printf("[🔷][ "+ SelfStats.Name+" ] Skipping, autoscan.js already running on. ( "+neighborStats.Name+" )." );
                    }
                }
            }
        }
        else 
        {
            output = "[ "+ SelfStats.Name+" ] ❌ Unsupported Mode !!"
            ns.printf(output);
            //printToTerm( output );
        }
    }
}

export async function OpenPorts(ns, target, requiredPorts)
{
    switch(requiredPorts)
    {
        case 5: { await ns.sqlinject( target ); }
        case 4: { await ns.httpworm( target ); }
        case 3: { await ns.relaysmtp( target ); }
        case 2: { await ns.ftpcrack( target ); }
        default: { await ns.brutessh( target ); }
    }
}

export function listServers(ns, maxDepth = 99) {
    let svObj = ( name = 'home', depth = 0 ) => ( { name: name, depth: depth } );
    let result = [];
    let visited = { 'home': 0 };
    let queue = Object.keys( visited );
    let name;
    while ( ( name = queue.pop() ) ) 
    {
        let depth = visited[ name ];
        result.push( svObj( name, depth ) );
        let scanRes = ns.scan( name );
        for (let i = scanRes.length; i >= 0; i--) 
        {
            if ( ( visited[ scanRes[i] ] === undefined ) && ( depth <= maxDepth ) )
            {
                queue.push( scanRes[i] );
                visited[ scanRes[i] ] = depth + 1;
            }
        }
    }
    return result;
}