on('ready', () => {
    
    log('RT: RoundFramework ready!');

    if (!state.rtnEncounter) {

        state.rtnEncounter = {

            combatRound: 1,
            turn: null,
            numOfCombatants: 0,
            trackingActive: false,
            difficulty: null

        };
    }

    let turnOrder = JSON.parse(Campaign().get('turnorder'));

    on('chat:message', async msg => {

        if (msg.type === 'api' && msg.content.includes('!combat')) {

            const option = msg.content.replace('!combat ', '');
            const rtnRoundFrameworkOptions = {

                // Displays the difficulty of the encounter if set to true
                ANNOUNCE_DIFFICULTY: true,
                // Divides the XP equally among the players if set to true, if set to false, gives all players the full amount
                DISTRIBUTE_XP: true,
                // Automatically adds the XP at the end of a battle
                AUTO_APPLY_XP: true,
                // Levels up players automatically if set to true
                AUTO_LEVEL_UP: true,
                // Multiplies the XP depending on encounter difficulty
                DIFFICULTY_MULTIPLIER: true,
            }

            switch (option) {

                case 'init':

                if (!playerIsGM(msg.playerid)) return;

                    state.rtnEncounter = {

                        combatRound: 1,
                        turn: 1,
                        numOfCombatants: 0,
                        trackingActive: false

                    };

                    turnOrder = JSON.parse(Campaign().get('turnorder'));

                    if (turnOrder) {

                        turnOrder = null;

                        Campaign().set('turnorder', JSON.stringify(turnOrder));

                    }

                    await sendChat('', `/desc Roll for initiative!\n[Start Tracking](!combat startTrack)`);
                    break;

                case 'startTrack':

                    if(!playerIsGM(msg.playerid)) return;

                    turnOrder = JSON.parse(Campaign().get('turnorder'));
                    if (!turnOrder) return sendChat('', '/desc The turn order is empty! Roll for initiative!');



                    state.rtnEncounter.numOfCombatants = turnOrder.length;
                    state.rtnEncounter.trackingActive = true;

                    state.rtnEncounter.difficulty = calculateCombatDifficulty(turnOrder);

                    await sendChat('', `/desc The battle has started!\n${state.rtnEncounter.difficulty}`)

                    outputRoundInfo(turnOrder);
                    break;


                case 'nextRound':

                    turnOrder = JSON.parse(Campaign().get('turnorder'));
                    const turnOf = getObj('graphic', turnOrder[state.rtnEncounter.turn - 1].id);

                    if (!state.rtnEncounter.trackingActive || !playerIsGM(msg.playerid) && msg.playerid !== turnOf.get('controlledby')) return;

                    state.rtnEncounter.turn++;
                    state.rtnEncounter.numOfCombatants = turnOrder.length;

                    if (state.rtnEncounter.numOfCombatants < state.rtnEncounter.turn) {

                        state.rtnEncounter.combatRound++;
                        state.rtnEncounter.turn = 1;

                    }

                    outputRoundInfo(turnOrder);
                    break;


                case 'stopTrack':
                    if (!state.rtnEncounter.trackingActive || !playerIsGM(msg.playerid)) return;
                    await sendChat('', '/desc Combat has ended!');
                    state.rtnEncounter.trackingActive = false;
                    break;

                default:
                    return;
            }
        }
    });

    on('change:campaign:turnorder', (obj, prev) => {

        if (obj.get('turnorder') === prev.turnorder) return;

        const turnOrder = JSON.parse(obj.get('turnorder')).sort((a, b) => { 
            return b.pr - a.pr;
        });

        obj.set('turnorder', JSON.stringify(turnOrder));

    });

    async function outputRoundInfo(turnOrder) {

        const turnOf = getObj('graphic', turnOrder[state.rtnEncounter.turn - 1].id);

        await sendChat('', `/desc ROUND: ${state.rtnEncounter.combatRound}`);
        await sendChat('', `/desc It is ${turnOf.get('name')}'s turn\n[Next turn](!combat nextRound) [End Encounter](!combat stopTrack)`);

        sendPing(turnOf.get('left'), turnOf.get('top'), Campaign().get('playerpageid'));

    }

    function calculateCombatDifficulty(turnOrder) {
        
        const playerLevels;
        const numOfMonsters;
    }

    function calculateXp(turnOrder) {

    }

    
});


