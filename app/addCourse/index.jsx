import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import React, { useContext, useState } from 'react';
import Button from '../../Components/shared/Button';
import { useRouter } from 'expo-router';
import { GenerateCourseAIModel, GenerateTopicsAIModel } from '../../config/AiModel';
import Prompt from '../../constants/Prompt';
import { db } from '../../config/firebaseConfig';
import { UserDetailContext } from '../../context/UserDetailContext';
import { doc, setDoc } from 'firebase/firestore';

export default function AddCourse() {
    const [loading, setLoading] = useState(false);
    const { userDetail } = useContext(UserDetailContext);
    const [userInput, setUserInput] = useState('');
    const [topics, setTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState([]);
    const router = useRouter();

    const onGenerateTopic = async () => {
        setLoading(true);
        try {
            const PROMPT = userInput + Prompt.IDEA;
            const aiResp = await GenerateTopicsAIModel.sendMessage(PROMPT);
            
            if (!aiResp || !aiResp.response || !aiResp.response.text) {
                throw new Error('Invalid AI response');
            }

            const aiText = aiResp.response.text().trim();
            if (!aiText) {
                throw new Error('Empty AI response');
            }

            const topicIdea = JSON.parse(aiText);
            console.log(topicIdea);
            setTopics(Array.isArray(topicIdea) ? topicIdea : []); // Ensure topics is always an array
        } catch (error) {
            console.error('Error generating topics:', error);
            alert('Failed to generate topics. Please try again.');
            setTopics([]); // Prevents undefined issues
        }
        setLoading(false);
    };

    const onTopicSelect = (topic) => {
        setSelectedTopic((prev) =>
            prev.includes(topic) ? prev.filter((item) => item !== topic) : [...prev, topic]
        );
    };

    const isTopicSelected = (topic) => selectedTopic.includes(topic);

    const onGenerateCourse = async () => {
        if (selectedTopic.length === 0) {
            alert('Please select at least one topic!');
            return;
        }

        setLoading(true);
        try {
            const PROMPT = selectedTopic.join(', ') + Prompt.COURSE;
            const aiResp = await GenerateCourseAIModel.sendMessage(PROMPT);

            if (!aiResp || !aiResp.response || !aiResp.response.text) {
                throw new Error('Invalid AI response');
            }

            const aiText = aiResp.response.text().trim();
            if (!aiText) {
                throw new Error('Empty AI response');
            }

            const resp = JSON.parse(aiText);

            if (!resp.courses || !Array.isArray(resp.courses) || resp.courses.length === 0) {
                throw new Error('No courses were generated. Please try again.');
            }

            const courses = resp.courses;

            // Save course info to database
            await Promise.all(
                courses.map(async (course) => {
                    const docId = Date.now().toString();
                    await setDoc(doc(db, 'Courses', docId), {
                        ...course,
                        createdOn: new Date(),
                        createdBy: userDetail?.email ?? '',
                        docId: docId
                    });
                })
            );

            setLoading(false);
            router.push('/(tabs)/home');
        } catch (e) {
            console.error('Error generating course:', e);
            alert('Failed to generate course. Please try again.');
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.heading}>Create New Course</Text>
            <Text style={styles.what}>What do you want to learn today?</Text>

            <TextInput
                placeholder="(Ex. Learn HTML)"
                style={styles.input}
                numberOfLines={3}
                multiline={true}
                onChangeText={(value) => setUserInput(value)}
            />

            <Button text="Generate Topic" type="outline" onPress={onGenerateTopic} loading={loading} />

            <View style={styles.select}>
                <Text style={styles.selectText}>Select the topics to be added in the Course</Text>
            </View>

            <View style={styles.topicContainer}>
                {topics.map((item, index) => (
                    <Pressable
                        key={index}
                        onPress={() => onTopicSelect(item)}
                        style={[styles.topicItem, isTopicSelected(item) && styles.selectedTopic]}
                    >
                        <Text style={[isTopicSelected(item) && styles.selectedTopicText]}>{item}</Text>
                    </Pressable>
                ))}
            </View>

            {selectedTopic.length > 0 && (
                <Button text="Generate Course" onPress={onGenerateCourse} loading={loading} />
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 25,
        backgroundColor: '#fff',
        flex: 1,
    },
    heading: {
        fontSize: 30,
        fontWeight: '900',
        color: '#3c0061',
    },
    what: {
        fontSize: 22,
        fontWeight: '400',
    },
    input: {
        padding: 15,
        borderWidth: 1,
        borderRadius: 15,
        height: 100,
        marginTop: 10,
        fontSize: 16,
    },
    select: {
        marginTop: 15,
        marginBottom: 10,
    },
    selectText: {
        fontSize: 18,
        fontWeight: '600',
    },
    topicContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 10,
    },
    topicItem: {
        padding: 7,
        borderWidth: 1,
        borderRadius: 99,
        paddingHorizontal: 15,
        paddingTop: 10,
    },
    selectedTopic: {
        backgroundColor: '#3c0061',
    },
    selectedTopicText: {
        color: '#fff',
    },
});
