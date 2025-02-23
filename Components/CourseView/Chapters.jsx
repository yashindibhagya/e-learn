import { View, Text ,StyleSheet, FlatList, TouchableOpacity} from 'react-native'
import React from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function Chapters({course}) {
    const router = useRouter();

    const isChapterCompleted = (index) => {
        const isCompleted = (course?.completedChapter || []).find(item => item == index);
        return !!isCompleted;
    };


  return (
    <View style={styles.container}>
      <Text style={styles.chapter}>Chapters</Text>
      <FlatList
      data={course?.chapters}
      renderItem={({item,index})=>(
        <TouchableOpacity onPress={()=>{
            router.push({
                pathname: '/chapterView',
                params: {
                    //chapterParams: item?.chapters,
                    chapterParams: JSON.stringify(item),
                    docId: course?.docId,
                    chapterIndex:index
                }
            })

        }} style={{
            padding: 18,
            borderWidth: 0.5,
            borderRadius: 15,
            marginTop: 10,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'

        }}>
            <View style={styles.chapterView}>
                <Text style={styles.chapterText}>{ index + 1}.</Text>
                <Text style={styles.chapterText}>{item.chapterTitle} </Text>
            </View>

            {isChapterCompleted(index)?
            <AntDesign name="checkcircle" size={24} color="green" />
            : <Ionicons name="play-circle" size={24} color="#3c0061" /> }
        </TouchableOpacity>
  )}
      />
    </View>
  )
}


const styles = StyleSheet.create({
    container:{
        padding:20
    },
    chapter:{
        fontWeight: 'bold',
        fontSize: 25
    },
    chapterText:{
        //fontWeight: 'bold',
        fontSize:18
    },
    chapterView:{
        display: 'flex',
        flexDirection: 'row',
        gap: 10
    }
})