# BitBunner Notes:

This is an attempt to build a all in one script (autoscan.js) to play bitburner.

The only cheat currently used is max RAM used bypass ( get docmuent via eval ).

- usage: run autoscript.js [w] 

with the W set it will run in worm mode following Worm logic below.
withou the W it will run as a network display on homeo only. else it will run PwnScript Logic below.

Many many many features missing but is a good start.


--------------------------------------

```mermaid
---
title: Worm Logic
---
    graph TD
    id0(( Start )) --> id1( Scan Network );
    subgraph sb1 [ ForEach ]
        direction LR
        sb2_id0{ Required \n Hacking Level? } -- No --> sb2_id1( Return Status )
        sb2_id0 -- Yes --> sb2_id2{ Required Ports? }
        sb2_id2 -- No --> sb2_id5{ Can Get A Port? }
        sb2_id5 -- Yes --> sb2_id6( Get Port )
        sb2_id5 -- No --> sb2_id1
        sb2_id6 --> sb2_id1
        sb2_id2 -- Yes --> sb2_id3( Nuke )
        sb2_id3 .-> sb2_id4( BackDoor )
        sb2_id4 --> sb2_id1
        sb2_id7{Rooted?} -- No --> sb2_id0
        sb2_id7 -- Yes --> sb2_id8( Copy Self and Execute )
        sb2_id8 --> sb2_id1
    end
    id1 --> sb1

```
--------------------------------------

```mermaid
---
title: PwnScript Logic
---
    graph TD
    id0((Start)) ==> id1{hasRootAccess?}
    subgraph sb1 [ Profit ]
        direction LR
        sb1_id0{Security Level?} -- Greater Than MinSecLevel --> sb1_id1( Weaken );
        sb1_id0 -- Equal MinSecLevel --> sb1_id2{ Has Money };
        sb1_id2 -- Under 75% --> sb1_id3( Grow );
        sb1_id2 -- Over 75% --> sb1_id4( Hack );
        sb1_id3 & sb1_id4 & sb1_id1 --> sb1_id5( Return Status )
    end

    subgraph sb2 [ Pwn ]
        direction LR
        sb2_id0{ Required \n Hacking Level? } -- No --> sb2_id1( Return Status )
        sb2_id0 -- Yes --> sb2_id2{ Required Ports? }
        sb2_id2 -- No --> sb2_id1
        sb2_id2 -- Yes --> sb2_id3( Nuke )
        sb2_id3 .-> sb2_id4( BackDoor )
        sb2_id4 --> sb2_id1
    end
    id1 -- Yes --> sb1;
    id1 -- No --> sb2;
    sb2 --> sb1;
    sb1 --> id2(( Send Status \n To Home ));

```
--------------------------------------