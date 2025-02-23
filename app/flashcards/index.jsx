import { View, Text, StyleSheet, Image, Pressable, Dimensions } from 'react-native'
import React, { useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';
import { FlatList } from 'react-native';
import FlipCard from 'react-native-flip-card'

export default function Flashcards() {
    const {courseParams} = useLocalSearchParams();
    const course=JSON.parse(courseParams);
    const flashcard = course?.flashcards
    const [currentPage , setCurrentPage] = useState(0);
    const router = useRouter()
    const width = Dimensions.get('screen').width

    const onScroll = (event) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / width); // Fix the typo here
        //console.log(index);
        setCurrentPage(index);
    };
    

  return (
    <View>
        <Image source={require('./../../assets/images/wave.png')} style={styles.wave}/>

        <View style={{
        position: 'absolute',
        padding: 25,
        width: '100%'
        }} >
            <View style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                    <Pressable onPress={() => router.back()}>
                        <Ionicons name="arrow-back-outline" size={24} color="white" />
                    </Pressable>

                    <Text style={styles.outOf}>
                        {currentPage + 1} of {flashcard?.length ?? 0}
                    </Text>
                    

            </View>

            <Text style={{
                    color: '#fff',
                    fontSize: 18,
                    marginTop: 10
                }}>Flip the card to reveal the answer!</Text>

            <FlatList
            data={flashcard}
            horizontal={true}
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            renderItem={({item,index})=>(
                <View 
                key={index}
                style={{
                    height: 500,
                    marginTop: 50
                }}>

                <FlipCard style={styles.flipcard}>
                    {/* Face Side */}
                    <View style={styles.frontCard}>
                        <Text style={styles.frontCardText}>{item?.term}</Text>
                    </View>

                    {/* Back Side */}
                    <View style={styles.backCard}>
                        <Text style={styles.backCardText}>{item?.definition}</Text>
                    </View>
                </FlipCard>
            </View>
        )}
        />
        </View>

    </View>
  )
}

const styles = StyleSheet.create({
    wave:{
        //height: 450,
        height: 1000,
        width: '100%'
    },
    outOf:{
        fontWeight: 'bold',
        fontSize: 20,
        color: '#fff'
    },
    flipcard:{
        width: Dimensions.get('screen').width * 0.78,
        height: 400,
        backgroundColor: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        marginHorizontal: Dimensions.get('screen').width*0.05,
        top: 40

    },
    frontCard:{
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        justifyContent: 'center',
        borderRadius: 20,
    },
    backCard:{
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        justifyContent: 'center',
        backgroundColor: '#3c0061',
        borderRadius: 20,
    },
    frontCardText:{
        fontWeight: 'bold',
        fontSize: 28,
        textAlign: 'center'
    },
    backCardText:{
        //fontWeight: 'bold',
        fontSize: 26,
        color:'#fff',
        width: Dimensions.get('screen').width * 0.78,
        padding: 15,
        textAlign: 'center'
    }
})