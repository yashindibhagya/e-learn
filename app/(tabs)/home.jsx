import { FlatList, Image, Platform, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import Header from '../../Components/Home/Header'
import NoCourse from '../../Components/Home/NoCourse'
import { collection, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { UserDetailContext } from '../../context/UserDetailContext';
import CourseList from '../../Components/Home/CourseList';
import PracticeSection from '../../Components/Home/PracticeSection';
import CourseProgress from '../../Components/Home/CourseProgress';


export default function home() {
  const {userDetail, setUserDetail} = useContext(UserDetailContext)
  const [courseList, setCourseList] = useState([]);

  //loading the content when user refresh 
  const [loading, setLoading] =useState(false)

  useEffect(()=>{
    userDetail && GetCourseList()
  }, [userDetail])


  const GetCourseList = async() =>{
    setLoading(true)
    //not to make duplicated in the courses
    setCourseList([])
    
    const q=query(collection(db, 'Courses'), where("createdBy" , '==', userDetail?.email))
    const querySnapshot = await getDocs(q)

    querySnapshot.forEach((doc) => {
      //console.log("--", doc.data())
      setCourseList(prev=>[...prev, doc.data()])
    })
    setLoading(false)
  }

  return (
    //scrollView can't be used with flatlist therefore listHeaderComponent is used to scroll the page
    <FlatList
    data={[]}

    //loading the content when user refresh 
    onRefresh={() => GetCourseList()}
    refreshing={loading}

    ListHeaderComponent={
      <View style={{
        flex: 1,
        backgroundColor: '#fff'
      }}>
        <Image source={require('./../../assets/images/wave.png')} style={styles.wave}/>
        <View style={styles.container}>
          <Header/>

          {courseList?.length ==0 ?
            <NoCourse/> :
            <View>
              <CourseProgress 
              courseList={courseList}
              />
              <PracticeSection/>
              <CourseList courseList={courseList}/>

            </View>
          }


        </View>
      </View>
    }/>
  )
}

const styles = StyleSheet.create({
  container:{
    padding: 25,
    paddingTop: Platform.OS == 'ios' && 45,
    //backgroundColor: '#3c0061',
    //backgroundColor: '#fff',
    //flex: 1
  },
  wave:{
    position:'absolute',
   // width: '100%',
    //height: 300
  }


})