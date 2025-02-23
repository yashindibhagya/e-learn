import { View, Text, Image, StyleSheet, Pressable, Dimensions, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';
import Button from '../../Components/shared/Button';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';

export default function Quiz() {
    const {courseParams} = useLocalSearchParams();
    const course = JSON.parse(courseParams);
    const [currentPage , setCurrentPage] = useState(0);
    const quiz = course?.quiz;
    const router = useRouter();
    const [result, setResult] = useState([])
    const [loading, setLoading] = useState(false)

    //progress bar
    const GetProgress=(currentPage)=>{
        const perc =(currentPage/quiz?.length);
        return perc;
    }
    //checking for the user select an option
    const [selectedOption, setSelectedOption] = useState();

    //save user selection
    const OnOptionSelect=(selectedChoice)=>{
        setResult(prev=>({
            ...prev,
            [currentPage]:{
                userChoice:selectedChoice,
                isCorrect: quiz[currentPage]?.correctAns == selectedChoice,
                question: quiz[currentPage]?.question,
                correctAns: quiz[currentPage]?.correctAns
            }
        }))
    }

    const onQuizFinish=async()=>{
        setLoading(true)
        //Save the result in database for quiz
        try{
            await updateDoc(doc(db, 'Courses',course?.docId),{
            quizResult:result
        })
        setLoading(false)

        //route for the summary page
        router.replace({
            pathname: '/quiz/summary',
            params:{
                quizResultParam: JSON.stringify(result)
            }
        })

    }
    catch(e)
    {
        setLoading(false)
    }
        //redirect user to quiz summary
    }
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
                {currentPage + 1} Out of {quiz?.length ?? 0}
            </Text>

        </View>

        <View style={styles.progressView}>
            <Progress.Bar progress={GetProgress(currentPage)} width={Dimensions.get('screen').width*0.85} color='#fff' height={10} />
        </View>

        <View style={styles.card}>
            <Text style={styles.cardText}>
                {quiz[currentPage]?.question}
            </Text>

            {quiz[currentPage]?.options.map((item,index)=>(
                <TouchableOpacity 
                onPress={()=>{setSelectedOption(index);
                    OnOptionSelect(item)
                }}
                key={index} style={{
                        padding: 20,
                        borderWidth: 1,
                        borderRadius: 15,
                        marginTop: 8,
                        backgroundColor: selectedOption === index ? 'purple' : null ,
                        //borderColor: selectedOption === index ? 'green' : 'black',// Replace 'blue' with your color variable if needed
                        color: selectedOption === index ? 'white' : 'black',// Replace 'blue' with your color variable if needed
                }}>
                    <Text style={[styles.optionsText,
                        {color: selectedOption === index ? 'white' : 'black' }]// Replace 'blue' with your color variable if needed
                    }>{item}</Text>
                </TouchableOpacity>
            ))}
        </View>

        {(selectedOption !== undefined && quiz?.length-1 > currentPage) && 
            <Button text={'Next'}
            onPress={()=>{setCurrentPage(currentPage+1); setSelectedOption(null);}} // Fix: Use setSelectedOption instead of selectedOption
        /> }

        {(selectedOption !== undefined && quiz?.length - 1 === currentPage) && 
            <Button text={'Finish'} 
            loading={loading}
            onPress={()=>onQuizFinish()}
            />}


      </View>
    </View>
  )
}

const styles = StyleSheet.create({
    wave:{
        height: 650,
        width: '100%'
    },
    outOf:{
        fontWeight: 'bold',
        fontSize: 20,
        color: '#fff'
    },
    progressView:{
        marginTop: 20
    },
    card:{
        padding: 25,
        backgroundColor: '#fff',
        marginTop: 30,
        height: Dimensions.get('screen').height * 0.65,
        elevation: 1,
        borderRadius: 20
    },
    cardText:{
        fontWeight: 'bold',
        fontSize: 25,
        //textAlign:'center'
    },
    optionsText:{
        fontSize: 16,
    }
})