import { View, Text, Image, StyleSheet, FlatList, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Entypo, Ionicons } from '@expo/vector-icons';
import Button from '../../Components/shared/Button';

export default function QuizSummary() {
    const router= useRouter();
    const { quizResultParam } = useLocalSearchParams();
    const quizResult = quizResultParam ? Object.values(JSON.parse(quizResultParam)) : []; // Convert object to array

    const [correctAns, setCorrectAns] = useState(0);
    const [totalQuestion, setTotalQuestion] = useState(0)
    useEffect(() => {
        //console.log("Received quizResultParam:", quizResultParam);
        //console.log("Parsed quizResult (Array Format):", quizResult);
        CalculateResult();
    }, [quizResult]);

    // Function to calculate results
    {/*
        const CalculateResult = () => {
        if (!Array.isArray(quizResult)) {
            console.error("quizResult is not an array:", quizResult);
            return;
        }
        const correctAns = quizResult.filter((item) => item?.isCorrect === true);
        console.log("Correct Answers:", correctAns.length);
    };
    */}

    const CalculateResult =()=>{
        if (quizResult !== undefined){
            const correctAns_ = Object.entries(quizResult)
            ?.filter(([key,value]) => 
                value?.isCorrect ==true)
            //console.log(correctAns)
        
            const totalQues_ = Object.keys(quizResult).length;

            setCorrectAns(correctAns_.length);
            setTotalQuestion(totalQues_)
        }
    }

    const GetPercMark =()=>{
        return ((correctAns/totalQuestion)*100).toFixed(0)
    }

    return (
        <FlatList
            data={[]}
            ListHeaderComponent={
        <View>
            <Image source={require('./../../assets/images/wave.png')} style={styles.image} />
            <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back-outline" size={24} color="white" />
            </Pressable>

            <View style={{
                position: 'absolute',
                width: '100%',
                padding: 35,
            }}>
                <Text style={styles.text}>Quiz Summary</Text>

                <View style={{
                    backgroundColor: '#fff',
                    padding: 20,
                    borderRadius: 20,
                    marginTop: 40,
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <Image source={require('./../../assets/images/trophy.png')} style={styles.trophy} />
                    <Text style={styles.congrats}>
                        {GetPercMark()>= 60? 'Congratulations!!' : 'Try Again!' }
                        </Text>
                    <Text style={styles.score}>
                        You have got {GetPercMark()}% of correct answers 
                    </Text>

                    <View style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginTop: 10
                    }}>
                        <View style={styles.resultTextContainer}>
                            <Text style={styles.resultText}> Q {totalQuestion} </Text>
                        </View>
                        <View style={styles.resultTextContainer}>
                            <Text style={styles.resultText}> <AntDesign name="checkcircle" size={20} color="green" /> {correctAns} </Text>
                        </View>
                        <View style={styles.resultTextContainer}>
                            <Text style={styles.resultText}> <Entypo name="circle-with-cross" size={21} color="red" /> {totalQuestion-correctAns} </Text>
                        </View>
                    
                    </View>
                    <Button text={'Back to Home'}
                    onPress={()=>router.replace('/(tabs)/home')}
                    />

                    
                </View>
                <View style={{
                        marginTop: 25,
                        //backgroundColor: '#fff',
                        flex: 1
                    }}>
                        <Text style={styles.summaryText}>Summary:</Text>
                        <FlatList
                            data={Object.entries(quizResult)}
                            renderItem={({item,index}) =>{
                                const quizItem = item[1]; 

                                return (
                                <View style={{
                                    backgroundColor: '#fff',
                                    padding: 15,
                                    borderWidth: 1,
                                    marginTop: 5,
                                    borderRadius: 15,
                                    backgroundColor: quizItem?.isCorrect==true? 'purple' : '#ffcccb',
                                    borderColor: quizItem?.isCorrect==true? 'purple' : '#ffcccb',
                                    

                                }}>
                    
                                    <Text style={{
                                        fontSize: 18,
                                        fontWeight: '600',
                                        color: quizItem?.isCorrect? 'white' : 'black'
                                    
                                    }}>
                                        {quizItem.question}</Text>

                                    <Text style={{
                                        fontSize: 12,
                                        color: quizItem?.isCorrect? 'white' : 'black'
                                    
                                    }}>
                                        Ans: {quizItem?.correctAns}</Text>

                                </View>
                                )

                            }}
                        />
                    </View>

            </View>
        </View> 
        }/>
    );
}

const styles = StyleSheet.create({
    image: {
        width: '100%',
        height: 650
    },
    text: {
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#fff',
        fontSize: 30
    },
    trophy: {
        width: 130,
        height: 130,
        marginTop: -70
    },
    congrats:{
        fontSize: 20,
        fontWeight: 'bold'
    },
    score:{
        color: 'gray',
        fontSize: 15
    },
    resultText:{
        fontWeight: '600',
        fontSize: 16
    },
    resultTextContainer:{
        padding: 15,
        backgroundColor: '#fff',
        elevation: 1
    },
    summaryText:{
        fontWeight: 'bold',
        fontSize: 20,
        color: '#fff'
    },
    backButton:{
        top: -620,
        left: 10,
    }
});
