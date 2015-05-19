# REACT.JS CODE

DropdownButton = ReactBootstrap.DropdownButton
ListGroupItem = ReactBootstrap.ListGroupItem
ButtonGroup = ReactBootstrap.ButtonGroup
PageHeader = ReactBootstrap.PageHeader
Jumbotron = ReactBootstrap.Jumbotron
ListGroup = ReactBootstrap.ListGroup
MenuItem = ReactBootstrap.MenuItem
NavItem = ReactBootstrap.NavItem
Button = ReactBootstrap.Button
Navbar = ReactBootstrap.Navbar
Input = ReactBootstrap.Input
Table = ReactBootstrap.Table
Label = ReactBootstrap.Label
Panel = ReactBootstrap.Panel
Grid = ReactBootstrap.Grid
Row = ReactBootstrap.Row
Col = ReactBootstrap.Col
Nav = ReactBootstrap.Nav

# ----------------------

CardImage = React.createClass
    render: ->
      <object data={'/images/' + (
                if       this.props.card[1] == "H" then "Hearts"
                else (if this.props.card[1] == "S" then "Spades"
                else (if this.props.card[1] == "C" then "Clubs"
                else (if this.props.card[1] == "D" then "Diamonds")))) +
                    "/" + this.props.card + '.svg'}
              type="image/svg+xml"
              className={this.props.className}>
      </object>

ConnectedPlayers = React.createClass
    render: ->
      <Panel header="Connected players">
        <Table striped bordered condensed>
          <thead>
            <tr>
              <th>ID</th>
              <th>name</th>
            </tr>
          </thead>
          {this.props.players.map((p) ->
            <tr>
              <td>{p.id}</td>
              <td>{p.name}</td>
            </tr>)}
        </Table>
      </Panel>


# STATES

WaitingForPlayers = React.createClass
    handleMessage: (tbl, sender, msg) -> {}
    getInitialState: ->
        players: []
    render: ->
      <div>
        <Grid id="game-grid">
          <Row id="row-game-main" className="row-centered">
            <Col xs={8} md={8} lg={6}>
              <h3>Waiting for players to join...</h3>
            </Col>
            <Col xs={3} md={3} lg={3}
                 xsoffset={2} mdoffset={3} lgoffset={4}>
              <ConnectedPlayers players={this.state.players}/>
            </Col>
          </Row>
        </Grid>
      </div>



MainState = React.createClass
    handleMessage: (tbl, sender, msg) -> {}
    render: ->
      <div>
        <Grid id="game-grid">
          <Row id="row-game-main" className="row-centered">
            <Col xs={8} md={8} lg={6}>
              <h3>Table goes here</h3>
            </Col>
          </Row>
        </Grid>
      </div>

table =
    state: null
    prevState: null
    container: null
    players: []
    state_data: null
    host: null
    states:
        init:          WaitingForPlayers
        main:          MainState

    handleMessage: (sender, m) ->
        switch m.action
            when "join"
                if this.state == "init"
                    # TODO handle reconnect?
                    if this.players.length == 0
                        console.log("First person joined: " + m.data.name)
                        this.host = m.data.name
                        console.log("sender: " + sender)
                        try
                            host_msg:
                                status:"host"
                                data:{}
                            # TODO make a helper for this
                            window.messageBus.send(sender, JSON.stringify(host_msg))
                        catch e
                            console.error(e)
                        console.log("afterwards...")
                    this.players.push(
                        name: m.data.name
                        id: sender
                    )
                    console.log(this.players)
                    this.container.setState(players: this.players)
                else
                    console.error("Cannot join once game has begun!")
                    # TODO relay this back to the user
            else
                this.container.handleMessage(this, sender, m)

    setState: (state_name, state_data) ->
        if this.state == state_name and this.container != null
            displayText("Updating state: " + state_data)
            this.container.setProps(state_data)
        else
            displayText("Setting state to: " + state_name)
            this.prevState = this.state
            this.state = state_name
            this.container = React.render(React.createElement(
                this.states[state_name], state_data),
                document.getElementById('content'))

window.onload = ->
    cast.receiver.logger.setLevelValue(0)
    window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance()
    if typeof console  != "undefined"
        if typeof console.log != 'undefined'
            console.olog = console.log
        else
            console.olog = () -> {}

    console.log = (message) ->
        console.olog(message)
        displayText(message)

    console.error = console.debug = console.info = console.log

    console.log('Starting Receiver Manager')
    # displayText('Starting Receiver Manager')
    table.setState('init', {})

    # handler for the 'ready' event
    castReceiverManager.onReady = (event) ->
        # Ready to create games
        console.log('Received Ready event: ' + JSON.stringify(event.data))
        window.castReceiverManager.setApplicationState("Application status is ready...")

    # handler for 'senderconnected' event
    castReceiverManager.onSenderConnected = (event) ->
        # TODO New player joining. Initiate buy-in on the client side.
        # NOTE Buy-in is typically:
        #        - 10x high limit
        #        - 20x big blind for no-limit games
        # If it is the only player, then make him the table owner
        console.log('Received Sender Connected event: ' + event.data)
        console.log(window.castReceiverManager.getSender(event.datxa).userAgent)

    # handler for 'senderdisconnected' event
    castReceiverManager.onSenderDisconnected = (event) ->
        # TODO
        # Player left the table. Allow that specific person to rejoin
        # Possibly keep their session in case their network died
        # What happens to their bid/pot contribution if we're in a
        # game?
        console.log('Received Sender Disconnected event: ' + event.data)
        if window.castReceiverManager.getSenders().length == 0
            window.close()

    # handler for 'systemvolumechanged' event
    castReceiverManager.onSystemVolumeChanged = (event) ->
        console.log('Received System Volume Changed event: ' + event.data.level + ' ' +
                    event.data.muted)
        # REVIEW likely don't need to handle this for MVP, since
        # there will be nothing to really play

    # create a CastMessageBus to handle messages for a custom namespace
    window.messageBus =
        window.castReceiverManager.getCastMessageBus('urn:x-cast:sadikov.apps.pokair')

    # handler for the CastMessageBus message event
    window.messageBus.onMessage = (event) ->
        # TODO define message types valid during different
        # even.data will be a json object that:
        # 1. Confirms the client knows the current STATE
        #    by sending the game state info.
        # 2. Uses the senderId to confirm the correct player is
        #    playing on this turn. Any other clients that try to make
        #    a move while its the turn of someone else will get
        #    dropped, rejected with error ID + message
        # 3. Includes a payload specific to the current STATE
        console.log('Message [' + event.senderId + ']: ' + event.data)

        # display the message from the sender
        # TODO replace this with a call to update the state or
        # substate
        table.handleMessage(event.senderId, JSON.parse(event.data))
        # inform all senders on the CastMessageBus of the incoming message event
        # sender message listener will be invoked

        # TODO Instead here send out the new state to all of the
        # clients.
        # window.messageBus.broadcast(
        #     status:'sdfsdf'
        #     data:
        #         blah:12312
        # )

        # Make POST requests

        # RECEIVER STATES
        # Allow for state mixins for exceptions.
        # Allow for substates
        # *Use a state mixin for each different "Betting" type

        # - Pre Game configuration. Use this time to change table
        #   settings. Should be able to do this at almost any point
        #   in time, but need to be smart about it - maybe use a
        #   majority vote to all the other players at the table.

        # & If someone joins after a round is played before the
        # pre-flop bets are placed, then add this player's turn to
        # the end of the list and deal them two cards. Withdraw their
        # ante and add it to the pot

        # - Deck Shuffle + Card dealing

        # - Flop

        # - Flop Betting*

        # - Turn

        # - Turn Betting*

        # - River

        # - River Betting*

        # - Showdown

    # initialize the CastReceiverManager with an application status message
    window.castReceiverManager.start({statusText: "Application is starting"})
    console.log('Receiver Manager started')

# utility function to display the text message in the input field
displayText = (text) ->
    dw = document.getElementById("message")
    dw.innerHTML += '\n' + text
    dw.scrollTop = dw.scrollHeight
