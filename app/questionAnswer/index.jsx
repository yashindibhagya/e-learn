import { View, Text, Image, StyleSheet, Pressable, FlatList } from 'react-native'
import React, { useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as Progress from 'react-native-progress';
import { Ionicons } from '@expo/vector-icons';

export default function QuestionAnswer() {
    const {courseParams}=useLocalSearchParams();
    const course = JSON.parse(courseParams);
    const qaList = course?.qna
    const router = useRouter()
    const [selectedQuestion, setSelectedQuestion] = useState()

    const OnQuestionSelect=(index)=>{
        if (selectedQuestion == index)
        {
            setSelectedQuestion(null)
        }
        else{
            setSelectedQuestion(index)
        }
    }

  return (
  <View>
      <Image source={require('./../../assets/images/wave.png')} style={styles.wave}/>

    <View style={{
        position: 'absolute',
        width: '100%',
        padding: 20,
        marginTop: 35
    }}>
        <View style={{
                display: 'flex',
                flexDirection: 'row',
                //justifyContent: 'space-between',
                alignItems: 'center',
                //gap: 7
        }}>

            <Pressable onPress={() => router.back()}>
                <Ionicons name="arrow-back-outline" size={24} color="white" style={styles.icon}/>
            </Pressable> 

            <Text style={styles.question}>Question & Answers</Text>

        </View>

        <Text style={styles.course}>{course?.courseName}</Text>

        <FlatList 
        data={qaList}
        renderItem={({item,index})=>(
            <Pressable style={styles.pressable}
            onPress={()=> OnQuestionSelect(index)}
            >
                <Text style={styles.pressableText}>{item?.question}</Text>

                {
                selectedQuestion ==index &&
                <View style={{
                    borderTopWidth: 0.5,
                    marginVertical: 10,
                    marginBottom: 10               
                }}>
                    
                    <Text style={styles.answer}>Answer: {item?.answer}</Text>
                </View>
                }

            </Pressable>
        )}
        />
    </View>

    </View>
  )
}

const styles = StyleSheet.create({
    wave:{
        height: 650,
        width: '100%'
    },
    question:{
        fontWeight: 'bold',
        color: '#fff',
        fontSize: 25,
        marginLeft: 5
    },
    course:{
        color: '#fff',
        fontSize: 18
    },
    pressable:{
        padding: 20,
        backgroundColor: '#fff',
        marginTop: 15,
        borderRadius: 15,
        elevation: 1

    },
    pressableText:{
        fontWeight: '600',
        fontSize: 18
    },
    answer:{
        fontSize: 14,
        color: 'green',
        marginTop:10
    },

})