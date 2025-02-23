import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, ScrollView, RefreshControl } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { query, collection, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { UserDetailContext } from '../../context/UserDetailContext';
import CourseProgressCard from '../../Components/shared/CourseProgressCard';
import { useRouter } from 'expo-router';

export default function Profile() {
  const router = useRouter()
  const { userDetail } = useContext(UserDetailContext)
  const [courseList, setCourseList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    userDetail && GetCourseList()
  }, [userDetail])

  const GetCourseList = async () => {
    setLoading(true)
    setCourseList([]) // Clear the list before fetching new data

    const q = query(collection(db, 'Courses'), where("createdBy", '==', userDetail?.email), orderBy('createdOn', 'desc'))
    const querySnapshot = await getDocs(q)

    const courses = [];
    querySnapshot.forEach((doc) => {
      courses.push(doc.data());
    })
    setCourseList(courses);
    setLoading(false)
  }

  return (
    <ScrollView 
      style={styles.container} 
      refreshControl={<RefreshControl refreshing={loading} onRefresh={GetCourseList} />}
    >
      <Image source={require('./../../assets/images/wave.png')} style={styles.wave} />

      <View style={styles.contentContainer}>
        <Text style={styles.courseText}>Course Progress</Text>

        <FlatList
          data={courseList}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          onRefresh={GetCourseList}
          refreshing={loading}
          scrollEnabled={false} // Disable FlatList scrolling, since ScrollView is handling it
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => router.push({
                pathname: '/courseView/' + item?.docId,
                params: { courseParams: JSON.stringify(item) }
              })}
            >
              <CourseProgressCard item={item} width={'95%'} />
            </TouchableOpacity>
          )}
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  wave: {
    position: 'absolute',
    width: '100%',
    height: 1000
  },
  contentContainer: {
    width: '100%',
    padding: 20,
    marginTop: 20
  },
  courseText: {
    fontWeight: 'bold',
    fontSize: 25,
    color: '#fff',
    marginBottom: 10
  }
});
