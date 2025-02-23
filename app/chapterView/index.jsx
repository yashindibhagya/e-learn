import { View, Text, StyleSheet, Dimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Progress from 'react-native-progress';
import Button from '../../Components/shared/Button';
import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';

export default function ChapterView() {
    const { chapterParams, docId, chapterIndex } = useLocalSearchParams();
    const chapters = JSON.parse(chapterParams); // Parse the chapter data from params
    const [currentPage, setCurrentPage] = useState(0); // Start from the first page
    const [loader, setLoader] = useState(false);
    const router = useRouter();

    // Convert content from object to array (if necessary)
    const contentArray = chapters?.content ? Object.values(chapters.content) : [];

    // Get Progress Percentage
    const GetProgress = (currentPage) => {
        return contentArray.length > 0 ? currentPage / contentArray.length : 0;
    };

    // Get the current content data dynamically
    const currentContent = contentArray[currentPage];

    const onChapterComplete = async () => {
        // Save Chapter complete
        setLoader(true);
        await updateDoc(doc(db, 'Courses', docId), {
            completedChapter: arrayUnion(chapterIndex),
        });
        setLoader(false);
        router.replace('/courseView/' + docId);
    };

    useEffect(() => {
        console.log('Fetched Chapters:', chapters);
        console.log('Current Page:', currentPage);
        console.log('Current Content:', currentContent);
    }, [currentPage, chapters]);

    return (
        <View style={styles.container}>
            {/* Progress Bar */}
            <Progress.Bar
                progress={GetProgress(currentPage)}
                color='#3c0061'
                width={Dimensions.get('screen').width * 0.85}
            />

            <View style={{ marginTop: 20 }}>
                {/* Display Topic if it exists */}
                {currentContent ? (
                    <View style={styles.topicContainer}>
                        <Text style={styles.topicText}>{currentContent.topic || 'No topic found'}</Text>
                    </View>
                ) : (
                    <Text style={{ color: 'red' }}>Content not available for the current page.</Text>
                )}

                {/* Display Explanation */}
                {currentContent?.explain && (
                    <Text style={styles.explanationText}>{currentContent.explain}</Text>
                )}

                {/* Display Code */}
                {currentContent?.code && (
                    <Text style={styles.codeText}>{currentContent.code}</Text>
                )}

                {/* Display Example */}
                {currentContent?.example && (
                    <Text style={styles.exampleText}>{currentContent.example}</Text>
                )}
            </View>

            {/* Navigation Buttons */}
            <View style={styles.buttonContainer}>
                {currentPage < contentArray.length - 1 ? (
                    <Button text={'Next'} onPress={() => setCurrentPage(currentPage + 1)} />
                ) : (
                    <Button text={'Finish'} onPress={() => onChapterComplete()} loading={loader} />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 25,
        backgroundColor: '#fff',
        flex: 1,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 15,
        width: '100%',
        left: 25,
    },
    topicContainer: {
        marginTop: 20,
    },
    topicText: {
        fontWeight: 'bold',
        fontSize: 25,
    },
    explanationText: {
        fontSize: 18,
        marginTop: 15,
    },
    codeText: {
        fontSize: 18,
        backgroundColor: '#3c0061',
        color: '#fff',
        padding: 15,
        marginTop: 15,
        borderRadius: 5,
    },
    exampleText: {
        fontSize: 18,
        marginTop: 15,
        padding: 15,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
    },
});

