import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, Dimensions, TextInput, ActivityIndicator } from 'react-native';

const WIDTH = Dimensions.get('window').width;
const numColumns = 2;

export default function PokemonList() {
  const [pokemon, setPokemon] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cantidadPokemon, setCantidadPokemon] = useState(10);

  const fetchAbilityInSpanish = async (abilityUrl) => {
    const response = await fetch(abilityUrl);
    const data = await response.json();
    const abilityEntry = data.names.find(entry => entry.language.name === 'es');
    return abilityEntry ? abilityEntry.name : 'Desconocida';
  };

  const fetchPokemonDetails = async (url) => {
    const response = await fetch(url);
    const data = await response.json();
    const abilityUrl = data.abilities?.[0]?.ability?.url || null;
    let ability = 'Desconocida';
    if (abilityUrl) {
      ability = await fetchAbilityInSpanish(abilityUrl);
    }

    const speciesResponse = await fetch(data.species.url);
    const speciesData = await speciesResponse.json();
    const descriptionEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'es');
    const description = descriptionEntry ? descriptionEntry.flavor_text.replace(/\s+/g, ' ') : 'No hay descripción disponible';

    return { ability, description };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${cantidadPokemon}`);
      const data = await response.json();
      const detailedPokemon = await Promise.all(data.results.map(async (result, index) => {
        const details = await fetchPokemonDetails(result.url);
        return { ...result, id: index + 1, ...details };
      }));
      setPokemon(detailedPokemon);
    } catch (error) {
      console.log("Hubo un error listando los pokemones", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [cantidadPokemon]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.id}.png` }} style={styles.image} />
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.subtitle}>Habilidad: {item.ability}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.formulario}>
        <Text style={styles.header}>Listado de Pokemones usando Fetch</Text>
        <TextInput
          style={styles.input}
          placeholder='20'
          keyboardType='numeric'
          value={String(cantidadPokemon)}
          onChangeText={(text) => setCantidadPokemon(Number(text))}
        />
      </View>
      {loading ? (
        <ActivityIndicator style={styles.loading} size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={pokemon}
          renderItem={renderItem}
          keyExtractor={(item) => item.name}
          numColumns={numColumns}
          contentContainerStyle={styles.list}
          style={styles.flatList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formulario: {
    padding: 20,
    backgroundColor: '#f1f1f1',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  list: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  flatList: {
    flex: 1,
  },
  card: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    margin: 5,
    width: WIDTH / numColumns - 10,
    alignItems: 'center',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
    textTransform: 'capitalize',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  description: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    marginTop: 5,
    paddingHorizontal: 5,
  },
  image: {
    width: 80,
    height: 80,
  },
  loading: {
    marginTop: 20,
  },
});
