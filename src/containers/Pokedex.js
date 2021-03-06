import {
  StyleSheet,
  View,
  ListView,
} from 'react-native';
import Immutable, { List } from 'immutable';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import SearchBar from '../components/SearchBar';
import MediaObject from '../components/MediaObject';
import Loader from '../components/Loader';
import clrs from '../utils/clrs';
import * as actions from '../actions';
import { filteredPokemon } from '../selectors';


class Pokedex extends Component {
  constructor(props) {
    super(props);

    const dataSource = new ListView.DataSource({
      rowHasChanged: (r1, r2) => !Immutable.is(r1, r2),
    });

    this.state = { pokemon: dataSource };
  }

  componentWillReceiveProps({ pokemon }) {
    this.setState({
      pokemon: this.state.pokemon.cloneWithRows(pokemon.toArray()),
    });
  }

  render() {
    const { pokemon } = this.state;
    const { goToPokemonDetail, filter, query, ready } = this.props;

    return (
      <Loader show={ !ready }>
        <View style={ styles.container }>

          <ListView dataSource={ pokemon }
            style={ styles.listView }
            renderRow={ (...args) => renderRow(goToPokemonDetail, ...args) }
            enableEmptySections />

          <SearchBar onChange={ filter } value={ query } />

          <KeyboardSpacer />

        </View>
      </Loader>
    );
  }
}

Pokedex.propTypes = {
  goToPokemonDetail: PropTypes.func,
  filter: PropTypes.func,
  pokemon: PropTypes.instanceOf(List),
  query: PropTypes.string,
  ready: PropTypes.bool,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: clrs.white,
  },
  listView: {
    flex: 1,
    alignSelf: 'stretch',
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Pokedex);

function mapStateToProps(state) {
  return {
    pokemon: filteredPokemon(state),
    query: state.pokemon.get('query'),
    ready: state.pokemon.get('ready'),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    filter: query => dispatch(actions.filter(query)),
    goToPokemonDetail: pokemon => {
      dispatch(actions.goToPokemonDetail(pokemon));
    },
  };
}

function renderRow(goTo, pokemon, sId, id) {
  const POKEMON_STATE = {
    title: pokemon.get('name'),
    url: pokemon.get('url'),
  };

  const re = /^.*pokemon\/(.+)\/$/;
  const matches = re.exec(pokemon.get('url'));
  const pokemonID = matches ? matches[1] : null;
  const imageUrl = (
    pokemonID ? `http://pokeapi.co/media/sprites/pokemon/${ pokemonID }.png` :
                null
  );

  return (
    <MediaObject index={ id }
      text={ pokemon.get('name') }
      imageUrl={ imageUrl }
      action={ () => goTo(POKEMON_STATE) } />
  );
}
