import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, Dimensions, TextInput, ActivityIndicator, Alert } from 'react-native';

const WIDTH = Dimensions.get('window').width;
const numColumns = 2;

export default function Actividad() {
    const [animeList, setAnimeList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchAnimeList = async () => {
        try {
            setLoading(true);
            const response = await fetch(`https://graphql.anilist.co`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    query: `
                    query ($search: String) {
                    Page {
                        media(search: $search, type: ANIME) {
                        id
                        title {
                            romaji
                            english
                        }
                        description
                        coverImage {
                            large
                        }
                        }
                    }
                    }
                `,
                    variables: { search: searchQuery },
                }),
            });
            const { data } = await response.json();
            setAnimeList(data.Page.media);
        } catch (error) {
            console.log("Hubo un error obteniendo la lista de anime", error);
            Alert.alert("Error", "Hubo un error obteniendo la lista de anime.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnimeList();
    }, [searchQuery]);

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Image source={{ uri: item.coverImage.large }} style={styles.image} />
            <Text style={styles.title}>{item.title.romaji || item.title.english}</Text>
            <Text style={styles.description}>{item.description}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.formulario}>
                <Text style={styles.header}>Buscar Anime</Text>
                <TextInput
                    style={[styles.input, { marginTop: 10 }]}
                    placeholder='Buscar por nombre'
                    value={searchQuery}
                    onChangeText={(text) => setSearchQuery(text)}
                />
            </View>
            {loading ? (
                <ActivityIndicator style={styles.loading} size="large" color="#0000ff" />
            ) : (
                <FlatList
                    data={animeList}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
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
    description: {
        fontSize: 12,
        color: '#333',
        textAlign: 'center',
        marginTop: 5,
        paddingHorizontal: 5,
    },
    image: {
        width: 80,
        height: 120,
    },
    loading: {
        marginTop: 20,
    },
});
