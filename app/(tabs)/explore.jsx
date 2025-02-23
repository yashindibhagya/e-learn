import { View, Text, StyleSheet, FlatList } from 'react-native'
import React from 'react'
import { CourseCategory } from '../../constants/Option';
import CourseListByCategory from '../../Components/Explore/CourseListByCategory';

export default function Explore() {
  return (
    <FlatList data={[]}
    style={{
      flex:1,
      backgroundColor:'#fff',
    }}
    
    ListHeaderComponent={
      
    <View style={styles.container}>
      <Text style={styles.explore}>Explore More Courses</Text>

      {/* Prevent error if CourseCategory is undefined */}
      {(CourseCategory || []).map((item, index) => (
        <View key={index} 
        style={{ marginTop: 10 }}>

{ /*         <Text style={{ fontWeight: 'bold', fontSize: 20 }}>
            {item}
          </Text>     */}
          <CourseListByCategory category={item}/>
        </View>
      ))}
    </View>
    }/>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 25,
    backgroundColor: '#fff',
    flex: 1
  },
  explore: {
    fontWeight: '900',
    fontSize: 26
  }
});
