// Generated by CoffeeScript 1.9.2
var Button, ButtonGroup, CardImage, Col, ConnectedPlayers, DropdownButton, Grid, Input, Jumbotron, Label, ListGroup, ListGroupItem, MainState, MenuItem, Nav, NavItem, Navbar, PageHeader, Panel, Players, Row, Table, TableInfo, WaitingForPlayers, Well, displayText, table;

DropdownButton = ReactBootstrap.DropdownButton;

ListGroupItem = ReactBootstrap.ListGroupItem;

ButtonGroup = ReactBootstrap.ButtonGroup;

PageHeader = ReactBootstrap.PageHeader;

Jumbotron = ReactBootstrap.Jumbotron;

ListGroup = ReactBootstrap.ListGroup;

MenuItem = ReactBootstrap.MenuItem;

NavItem = ReactBootstrap.NavItem;

Button = ReactBootstrap.Button;

Navbar = ReactBootstrap.Navbar;

Input = ReactBootstrap.Input;

Table = ReactBootstrap.Table;

Label = ReactBootstrap.Label;

Panel = ReactBootstrap.Panel;

Grid = ReactBootstrap.Grid;

Well = ReactBootstrap.Well;

Row = ReactBootstrap.Row;

Col = ReactBootstrap.Col;

Nav = ReactBootstrap.Nav;

CardImage = React.createClass({
  render: function() {
    return React.createElement("object", {
      "data": (!this.props.card ? '/images/card_outline.svg' : '/images/' + (this.props.card[this.props.card.length - 1] === "H" ? "Hearts" : (this.props.card[this.props.card.length - 1] === "S" ? "Spades" : (this.props.card[this.props.card.length - 1] === "C" ? "Clubs" : (this.props.card[this.props.card.length - 1] === "D" ? "Diamonds" : void 0)))) + "/" + this.props.card + '.svg'),
      "type": "image/svg+xml",
      "width": "100px",
      "className": this.props.className
    });
  }
});

TableInfo = React.createClass({
  render: function() {
    return React.createElement("div", {
      "className": "vertical-center"
    }, React.createElement(Panel, {
      "header": "Community Cards - " + this.props.communityState,
      "className": "panel-transparent"
    }, React.createElement("ul", {
      "className": "list-inline"
    }, React.createElement("li", null, React.createElement(CardImage, {
      "card": this.props.cards.flop[0]
    })), React.createElement("li", null, React.createElement(CardImage, {
      "card": this.props.cards.flop[1]
    })), React.createElement("li", null, React.createElement(CardImage, {
      "card": this.props.cards.flop[2]
    })), React.createElement("li", null, React.createElement(CardImage, {
      "card": this.props.cards.turn
    })), React.createElement("li", null, React.createElement(CardImage, {
      "card": this.props.cards.river
    }))), React.createElement("ul", {
      "className": "list-inline"
    }, React.createElement("li", null, "Current bid: ", React.createElement(Label, {
      "bsStyle": "danger"
    }, "$" + this.props.bid)), React.createElement("li", null, "Total pot: ", React.createElement(Label, {
      "bsStyle": "success"
    }, "$" + this.props.pot)))));
  }
});

ConnectedPlayers = React.createClass({
  render: function() {
    return React.createElement(Panel, {
      "header": "Connected players"
    }, React.createElement(Table, {
      "striped": true,
      "bordered": true,
      "condensed": true
    }, React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", null, "name"))), this.props.players.map(function(p) {
      return React.createElement("tr", null, React.createElement("td", null, p.name));
    })));
  }
});

Players = React.createClass({
  render: function() {
    var angle, hdr, i, j, leftStyle, len, offset, p, radius, ref, spans, startAngle, style, topStyle;
    startAngle = Math.PI / this.props.players.length;
    angle = startAngle / 2;
    radius = 500;
    offset = window.innerWidth / 2 - 100;
    spans = [];
    i = 0;
    ref = this.props.players;
    for (j = 0, len = ref.length; j < len; j++) {
      p = ref[j];
      leftStyle = radius * Math.cos(angle) + offset + 'px';
      topStyle = radius * Math.sin(angle) - 100 + 'px';
      style = {
        left: leftStyle,
        top: topStyle
      };
      angle += startAngle;
      hdr = p.name + (p.dealer ? " - Dealer" : p.blind === "S" ? " - Small Blind" : p.blind === "B" ? " - Big Blind" : "");
      spans.push(React.createElement(Panel, {
        "key": i,
        "className": "semicircle panel-transparent " + (this.props.turn === p.name ? "player-turn" : ""),
        "style": style,
        "header": hdr
      }, (!this.props.players[i].fold ? React.createElement("p", null, "Bid: $" + this.props.players[i].bid) : React.createElement("p", null, "FOLD"))));
      i += 1;
    }
    return React.createElement("div", {
      "id": "player-display"
    }, spans);
  }
});

WaitingForPlayers = React.createClass({
  handleMessage: function(tbl, sender, msg) {
    if (msg.action === "start") {
      window.messageBus.broadcast(JSON.stringify({
        status: "start",
        data: msg.data
      }));
      return table.setState('main', {});
    }
  },
  getInitialState: function() {
    return {
      players: []
    };
  },
  render: function() {
    return React.createElement("div", null, React.createElement(Grid, {
      "id": "game-grid"
    }, React.createElement(Row, {
      "id": "row-game-main",
      "className": "row-centered"
    }, React.createElement(Col, {
      "xs": 8.,
      "md": 8.,
      "lg": 6.
    }, React.createElement("h3", null, "Waiting for players to join..."), React.createElement(ConnectedPlayers, {
      "players": this.state.players
    })))));
  }
});

MainState = React.createClass({
  foldPlayer: function(sender) {
    var e, p, pi, players;
    try {
      pi = this.state.players.map(function(e) {
        return e.id;
      }).indexOf(sender);
      players = this.state.players;
      p = players[pi];
      p.fold = true;
      console.log(p.name + " has folded their hand");
      players[pi] = p;
      this.setState({
        players: players,
        turn: players[(pi + 1) % players.length].name
      });
      return window.messageBus.broadcast(JSON.stringify({
        status: "turn",
        data: {
          turn: this.state.turn
        }
      }));
    } catch (_error) {
      e = _error;
      return console.error(e);
    }
  },
  handleMessage: function(tbl, sender, msg) {
    switch (msg.action) {
      case "fold":
        return this.foldPlayer(sender);
      case "raise":
        return this.raisePlayer();
      default:
        return console.error("Unknown message received");
    }
  },
  generateSortedDeck: function() {
    var allCards, c, cards, j, k, len, len1, s, suits;
    suits = ["H", "D", "S", "C"];
    cards = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    allCards = [];
    for (j = 0, len = suits.length; j < len; j++) {
      s = suits[j];
      for (k = 0, len1 = cards.length; k < len1; k++) {
        c = cards[k];
        allCards.push(c + s);
      }
    }
    return allCards;
  },
  shuffle: function(cards) {
    var counter, index, temp;
    counter = cards.length;
    while (counter > 0) {
      index = Math.floor(Math.random() * counter);
      counter--;
      temp = cards[counter];
      cards[counter] = cards[index];
      cards[index] = temp;
    }
    return cards;
  },
  dealHand: function(dealer) {
    var bid, bigBlind, e, firstTurn, i, j, len, p, player, players, ref, smallBlind;
    smallBlind = (dealer + 1) % table.players.length;
    bigBlind = (smallBlind + 1) % table.players.length;
    i = 0;
    players = [];
    ref = table.players;
    for (j = 0, len = ref.length; j < len; j++) {
      p = ref[j];
      bid = smallBlind === i ? table.rules.smallBlind : bigBlind === i ? table.rules.bigBlind : 0;
      player = {
        id: p.id,
        name: p.name,
        dealer: dealer === i ? true : false,
        blind: smallBlind === i ? "S" : bigBlind === i ? "B" : "N",
        bid: bid,
        remaining: table.rules.buyIn - bid,
        fold: false,
        hand: [table.deck.shift(), table.deck.shift()]
      };
      players.push(player);
      try {
        window.messageBus.send(player.id, JSON.stringify({
          status: "deal",
          data: player
        }));
      } catch (_error) {
        e = _error;
        console.error(e);
      }
      i++;
    }
    firstTurn = players[(bigBlind + 1) % players.length].name;
    try {
      window.messageBus.broadcast(JSON.stringify({
        status: "turn",
        data: {
          turn: firstTurn
        }
      }));
    } catch (_error) {
      e = _error;
      console.error(e);
    }
    return [firstTurn, players];
  },
  getInitialState: function() {
    var firstTurn, players, ref;
    table.deck = this.shuffle(this.generateSortedDeck());
    ref = this.dealHand(Math.floor(Math.random() * table.players.length)), firstTurn = ref[0], players = ref[1];
    return {
      community: "Preflop",
      communityCards: {
        flop: [null, null, null],
        turn: null,
        river: null
      },
      players: players,
      turn: firstTurn,
      bid: table.rules.bigBlind,
      pot: table.rules.bigBlind + table.rules.smallBlind,
      hand: 1
    };
  },
  render: function() {
    return React.createElement("div", null, React.createElement(TableInfo, {
      "cards": this.state.communityCards,
      "communityState": this.state.community,
      "bid": this.state.bid,
      "pot": this.state.pot
    }), React.createElement(Players, {
      "players": this.state.players,
      "turn": this.state.turn
    }));
  }
});

table = {
  state: null,
  prevState: null,
  container: null,
  players: [],
  state_data: null,
  host: null,
  rules: {
    buyIn: 1000,
    bigBlind: 10,
    smallBlind: 5
  },
  states: {
    init: WaitingForPlayers,
    main: MainState
  },
  handleMessage: function(sender, m) {
    var e, isReconnecting;
    isReconnecting = function(players) {
      var j, len, p;
      for (j = 0, len = players.length; j < len; j++) {
        p = players[j];
        if (p.name === m.data.name && p.id.split(':')[0] === sender.split(':')[0]) {
          console.log("Reconnecting user " + p.name);
          return true;
        }
      }
      return false;
    };
    switch (m.action) {
      case "join":
        if (this.state === "init") {
          try {
            if (isReconnecting(this.players)) {
              if (this.host === m.data.name) {
                return window.messageBus.send(sender, JSON.stringify({
                  status: "host",
                  data: {}
                }));
              }
            } else {
              if (this.players.length === 0) {
                console.log("First person joined: " + m.data.name);
                this.host = m.data.name;
                window.messageBus.send(sender, JSON.stringify({
                  status: "host",
                  data: {}
                }));
              }
              this.players.push({
                name: m.data.name,
                id: sender
              });
              return this.container.setState({
                players: this.players
              });
            }
          } catch (_error) {
            e = _error;
            return console.error(e);
          }
        } else if (this.state === "main") {
          if (isReconnecting(this.players)) {
            return window.messageBus.send(sender, JSON.stringify({
              status: "start",
              data: {}
            }));
          }
        } else {
          return console.error("Cannot join once game has begun!");
        }
        break;
      default:
        return this.container.handleMessage(this, sender, m);
    }
  },
  setState: function(state_name, state_data) {
    if (this.state === state_name && this.container !== null) {
      displayText("Updating state: " + state_data);
      return this.container.setProps(state_data);
    } else {
      displayText("Setting state to: " + state_name);
      this.prevState = this.state;
      this.state = state_name;
      return this.container = React.render(React.createElement(this.states[state_name], state_data), document.getElementById('content'));
    }
  }
};

window.onload = function() {
  cast.receiver.logger.setLevelValue(0);
  window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
  if (typeof console !== "undefined") {
    if (typeof console.log !== 'undefined') {
      console.olog = console.log;
    } else {
      console.olog = function() {
        return {};
      };
    }
  }
  console.log = function(message) {
    console.olog(message);
    return displayText(message);
  };
  console.error = console.debug = console.info = console.log;
  console.log('Starting Receiver Manager');
  table.setState('init', {});
  castReceiverManager.onReady = function(event) {
    console.log('Received Ready event: ' + JSON.stringify(event.data));
    return window.castReceiverManager.setApplicationState("Application status is ready...");
  };
  castReceiverManager.onSenderConnected = function(event) {
    console.log('Received Sender Connected event: ' + event.data);
    return console.log(window.castReceiverManager.getSender(event.datxa).userAgent);
  };
  castReceiverManager.onSenderDisconnected = function(event) {
    console.log('Received Sender Disconnected event: ' + event.data);
    if (window.castReceiverManager.getSenders().length === 0) {
      return window.close();
    }
  };
  castReceiverManager.onSystemVolumeChanged = function(event) {
    return console.log('Received System Volume Changed event: ' + event.data.level + ' ' + event.data.muted);
  };
  window.messageBus = window.castReceiverManager.getCastMessageBus('urn:x-cast:sadikov.apps.pokair');
  window.messageBus.onMessage = function(event) {
    console.log('Message [' + event.senderId + ']: ' + event.data);
    return table.handleMessage(event.senderId, JSON.parse(event.data));
  };
  window.castReceiverManager.start({
    statusText: "Application is starting"
  });
  return console.log('Receiver Manager started');
};

displayText = function(text) {
  var dw;
  dw = document.getElementById("message");
  dw.innerHTML += '\n' + text;
  return dw.scrollTop = dw.scrollHeight;
};
