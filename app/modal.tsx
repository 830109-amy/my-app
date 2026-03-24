import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, SafeAreaView, Alert, Modal, Image, FlatList, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SLEEP_OPTIONS = ['良好', '一般', '差'];

export default function ModalScreen() {
  const router = useRouter();
  const { year, month, day } = useLocalSearchParams();
  const dateKey = `record_${year}_${month}_${day}`;
  
  // 目標攝取狀態
  const [tStarch, setTStarch] = useState('3');
  const [tProtein, setTProtein] = useState('3');
  const [tVeg, setTVeg] = useState('6');

  // 飲食紀錄狀態 (早餐、中餐、晚餐)
  const [bStarch, setBStarch] = useState('');
  const [bProtein, setBProtein] = useState('');
  const [bVeg, setBVeg] = useState('');
  
  const [lStarch, setLStarch] = useState('');
  const [lProtein, setLProtein] = useState('');
  const [lVeg, setLVeg] = useState('');
  
  const [dStarch, setDStarch] = useState('');
  const [dProtein, setDProtein] = useState('');
  const [dVeg, setDVeg] = useState('');

  // 即時計算總量
  const totalStarch = (parseFloat(bStarch) || 0) + (parseFloat(lStarch) || 0) + (parseFloat(dStarch) || 0);
  const totalProtein = (parseFloat(bProtein) || 0) + (parseFloat(lProtein) || 0) + (parseFloat(dProtein) || 0);
  const totalVeg = (parseFloat(bVeg) || 0) + (parseFloat(lVeg) || 0) + (parseFloat(dVeg) || 0);

  // 其他表單狀態
  const [water, setWater] = useState('');
  const [evilFood, setEvilFood] = useState<string | null>(null);
  const [evilFoodNote, setEvilFoodNote] = useState('');
  const [gathering, setGathering] = useState<string | null>(null);
  const [gatheringNote, setGatheringNote] = useState('');
  const [sleepStatus, setSleepStatus] = useState<string | null>(null);
  const [sleepHours, setSleepHours] = useState('');
  const [stress, setStress] = useState<string | null>(null);
  const [fatigue, setFatigue] = useState<string | null>(null);
  const [poop, setPoop] = useState<string | null>(null);
  const [edema, setEdema] = useState<string | null>(null);
  const [period, setPeriod] = useState<string | null>(null);
  const [satiety, setSatiety] = useState<string | null>(null);
  const [exercise, setExercise] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  // 下拉選單狀態
  const [isSleepPickerVisible, setSleepPickerVisible] = useState(false);

  // 讀取現有紀錄
  useEffect(() => {
    const loadRecord = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(dateKey);
        if (jsonValue != null) {
          const data = JSON.parse(jsonValue);
          setTStarch(data.tStarch || '3');
          setTProtein(data.tProtein || '3');
          setTVeg(data.tVeg || '6');
          setBStarch(data.bStarch || '');
          setBProtein(data.bProtein || '');
          setBVeg(data.bVeg || '');
          setLStarch(data.lStarch || '');
          setLProtein(data.lProtein || '');
          setLVeg(data.lVeg || '');
          setDStarch(data.dStarch || '');
          setDProtein(data.dProtein || '');
          setDVeg(data.dVeg || '');
          setWater(data.water || '');
          setEvilFood(data.evilFood || null);
          setEvilFoodNote(data.evilFoodNote || '');
          setGathering(data.gathering || null);
          setGatheringNote(data.gatheringNote || '');
          setSleepStatus(data.sleepStatus || null);
          setSleepHours(data.sleepHours || '');
          setStress(data.stress || null);
          setFatigue(data.fatigue || null);
          setPoop(data.poop || null);
          setEdema(data.edema || null);
          setPeriod(data.period || null);
          setSatiety(data.satiety || null);
          setExercise(data.exercise || '');
          setImages(data.images || []);
        }
      } catch (e) {
        console.error('讀取紀錄失敗', e);
      }
    };
    loadRecord();
  }, [dateKey]);

  const handleSave = async () => {
    try {
      const isEmpty = [
        bStarch, bProtein, bVeg,
        lStarch, lProtein, lVeg,
        dStarch, dProtein, dVeg,
        water, evilFood, evilFoodNote,
        gathering, gatheringNote, sleepStatus, sleepHours, stress,
        fatigue, poop, edema, period, satiety, exercise
      ].every(val => val === '' || val === null) && images.length === 0;

      if (isEmpty) {
        await AsyncStorage.removeItem(dateKey);
        router.back();
        return;
      }

      const data = {
        tStarch, tProtein, tVeg,
        bStarch, bProtein, bVeg,
        lStarch, lProtein, lVeg,
        dStarch, dProtein, dVeg,
        water, evilFood, evilFoodNote,
        gathering, gatheringNote, sleepStatus, sleepHours, stress,
        fatigue, poop, edema, period, satiety, exercise,
        images,
        lastUpdated: new Date().toISOString(),
      };
      await AsyncStorage.setItem(dateKey, JSON.stringify(data));
      router.back();
    } catch (e) {
      console.error('儲存紀錄失敗', e);
      Alert.alert('儲存失敗', '請稍後再試。');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    Alert.alert('確認刪除', '確定要刪除這張照片嗎？', [
      { text: '取消', style: 'cancel' },
      { 
        text: '刪除', 
        style: 'destructive',
        onPress: () => {
          const newImages = [...images];
          newImages.splice(index, 1);
          setImages(newImages);
        }
      }
    ]);
  };

  const renderMealSection = (title: string, starch: string, setStarch: (v: string) => void, protein: string, setProtein: (v: string) => void, veg: string, setVeg: (v: string) => void) => (
    <View style={styles.mealContainer}>
      <Text style={styles.mealTitle}>{title}</Text>
      <View style={styles.inputRow}>
        <View style={styles.inputCol}>
          <Text style={styles.subLabel}>澱粉</Text>
          <TextInput 
            style={styles.input} 
            placeholder="0" 
            keyboardType="numeric"
            value={starch}
            onChangeText={setStarch}
          />
        </View>
        <View style={styles.inputCol}>
          <Text style={styles.subLabel}>蛋白質</Text>
          <TextInput 
            style={styles.input} 
            placeholder="0" 
            keyboardType="numeric"
            value={protein}
            onChangeText={setProtein}
          />
        </View>
        <View style={styles.inputCol}>
          <Text style={styles.subLabel}>蔬菜</Text>
          <TextInput 
            style={styles.input} 
            placeholder="0" 
            keyboardType="numeric"
            value={veg}
            onChangeText={setVeg}
          />
        </View>
      </View>
    </View>
  );

  const renderOption = (current: string | null, value: string, setter: (v: string) => void) => (
    <TouchableOpacity 
      style={[styles.optionButton, current === value && styles.optionButtonActive]} 
      onPress={() => setter(value)}
    >
      <Text style={[styles.optionText, current === value && styles.optionTextActive]}>{value}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>{year}年{month}月{day}日 紀錄</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>儲存</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        
        {/* 0. 目標攝取設定 */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>1. 目標攝取設定</Text>
          </View>
          <View style={styles.inputRow}>
            <View style={styles.inputCol}>
              <Text style={styles.subLabel}>澱粉目標</Text>
              <TextInput 
                style={styles.targetInput} 
                keyboardType="numeric"
                value={tStarch}
                onChangeText={setTStarch}
              />
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.subLabel}>蛋白目標</Text>
              <TextInput 
                style={styles.targetInput} 
                keyboardType="numeric"
                value={tProtein}
                onChangeText={setTProtein}
              />
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.subLabel}>蔬菜目標</Text>
              <TextInput 
                style={styles.targetInput} 
                keyboardType="numeric"
                value={tVeg}
                onChangeText={setTVeg}
              />
            </View>
          </View>
        </View>

        {/* 1. 目前加總 */}
        <View style={styles.section}>
          <Text style={styles.label}>2. 目前加總與攝取</Text>
          <View style={styles.summaryBox}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>澱粉</Text>
              <Text style={[
                styles.summaryValue, 
                totalStarch > (parseFloat(tStarch)||0) ? styles.exceedText : 
                totalStarch === (parseFloat(tStarch)||0) ? styles.successText : null
              ]}>
                {totalStarch} / {tStarch}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>蛋白質</Text>
              <Text style={[
                styles.summaryValue, 
                totalProtein > (parseFloat(tProtein)||0) ? styles.exceedText : 
                totalProtein === (parseFloat(tProtein)||0) ? styles.successText : null
              ]}>
                {totalProtein} / {tProtein}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>蔬菜</Text>
              <Text style={[
                styles.summaryValue, 
                totalVeg > (parseFloat(tVeg)||0) ? styles.exceedText : 
                totalVeg === (parseFloat(tVeg)||0) ? styles.successText : null
              ]}>
                {totalVeg} / {tVeg}
              </Text>
            </View>
          </View>
          
          {renderMealSection('早餐', bStarch, setBStarch, bProtein, setBProtein, bVeg, setBVeg)}
          {renderMealSection('中餐', lStarch, setLStarch, lProtein, setLProtein, lVeg, setLVeg)}
          {renderMealSection('晚餐', dStarch, setDStarch, dProtein, setDProtein, dVeg, setDVeg)}
        </View>

        {/* 2. 水量 */}
        <View style={styles.section}>
          <Text style={styles.label}>3. 水量 (ml)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="請輸入攝取水量" 
            keyboardType="numeric"
            value={water}
            onChangeText={setWater}
          />
        </View>

        {/* 3. 邪惡食物 */}
        <View style={styles.section}>
          <Text style={styles.label}>4. 是否有邪惡食物</Text>
          <View style={styles.optionRow}>
            {renderOption(evilFood, '有', setEvilFood)}
            {renderOption(evilFood, '無', setEvilFood)}
          </View>
          <TextInput 
            style={styles.input} 
            placeholder="備註內容" 
            value={evilFoodNote}
            onChangeText={setEvilFoodNote}
            multiline
          />
        </View>

        {/* 4. 聚餐 */}
        <View style={styles.section}>
          <Text style={styles.label}>5. 是否有聚餐</Text>
          <View style={styles.optionRow}>
            {renderOption(gathering, '有', setGathering)}
            {renderOption(gathering, '無', setGathering)}
          </View>
          <TextInput 
            style={styles.input} 
            placeholder="餐廳或餐點" 
            value={gatheringNote}
            onChangeText={setGatheringNote}
            multiline
          />
        </View>

        {/* 5. 睡眠狀況 */}
        <View style={styles.section}>
          <Text style={styles.label}>6. 前一天睡眠狀況</Text>
          <View style={styles.sleepRow}>
            <TouchableOpacity 
              style={styles.dropdown}
              onPress={() => setSleepPickerVisible(true)}
            >
              <Text style={styles.dropdownText}>{sleepStatus || '選擇狀況'}</Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>

            <View style={styles.sleepInputWrapper}>
              <TextInput 
                style={styles.sleepInput} 
                placeholder="0" 
                keyboardType="numeric"
                value={sleepHours}
                onChangeText={setSleepHours}
              />
              <Text style={styles.unitText}>hr</Text>
            </View>
          </View>
        </View>

        {/* 6. 壓力狀況 */}
        <View style={styles.section}>
          <Text style={styles.label}>7. 壓力狀況</Text>
          <View style={styles.optionRow}>
            {renderOption(stress, '高', setStress)}
            {renderOption(stress, '中', setStress)}
            {renderOption(stress, '低', setStress)}
          </View>
        </View>

        {/* 7. 疲勞狀況 */}
        <View style={styles.section}>
          <Text style={styles.label}>8. 疲勞狀況</Text>
          <View style={styles.optionRow}>
            {renderOption(fatigue, '高', setFatigue)}
            {renderOption(fatigue, '中', setFatigue)}
            {renderOption(fatigue, '低', setFatigue)}
          </View>
        </View>

        {/* 8. 便便狀況 */}
        <View style={styles.section}>
          <Text style={styles.label}>9. 便便狀況</Text>
          <View style={styles.optionRow}>
            {renderOption(poop, '正常', setPoop)}
            {renderOption(poop, '便秘', setPoop)}
            {renderOption(poop, '腹瀉', setPoop)}
          </View>
        </View>

        {/* 9. 水腫狀況 */}
        <View style={styles.section}>
          <Text style={styles.label}>10. 水腫狀況</Text>
          <View style={styles.optionRow}>
            {renderOption(edema, '無', setEdema)}
            {renderOption(edema, '輕微', setEdema)}
            {renderOption(edema, '嚴重', setEdema)}
          </View>
          <View style={styles.optionRow}>
            {renderOption(period, '生理期', setPeriod)}
            {renderOption(period, '非生理期', setPeriod)}
          </View>
        </View>

        {/* 10. 飽足感 */}
        <View style={styles.section}>
          <Text style={styles.label}>11. 飽足感狀況</Text>
          <View style={styles.optionRow}>
            {renderOption(satiety, '過飽', setSatiety)}
            {renderOption(satiety, '剛好', setSatiety)}
            {renderOption(satiety, '飢餓', setSatiety)}
          </View>
        </View>

        {/* 11. 運動 */}
        <View style={styles.section}>
          <Text style={styles.label}>12. 運動內容</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            placeholder="輸入今天的運動或活動" 
            multiline
            value={exercise}
            onChangeText={setExercise}
          />
        </View>

        {/* 12. 照片紀錄 */}
        <View style={styles.section}>
          <Text style={styles.label}>13. 照片紀錄</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <TouchableOpacity onPress={() => setPreviewIndex(index)}>
                  <Image source={{ uri }} style={styles.imageThumb} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.smallDeleteButton} onPress={() => removeImage(index)}>
                  <Ionicons name="close-circle" size={24} color="#FF5252" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
              <Ionicons name="camera" size={32} color="#AAA" />
              <Text style={styles.addImageText}>新增照片</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* 照片預覽 Modal (點擊關閉) */}
      <Modal
        visible={previewIndex !== null}
        transparent={true}
        onRequestClose={() => setPreviewIndex(null)}
      >
        <View style={styles.previewContainer}>
          <TouchableOpacity 
            style={styles.previewClose} 
            onPress={() => setPreviewIndex(null)}
          >
            <Ionicons name="close" size={36} color="#FFF" />
          </TouchableOpacity>
          
          {previewIndex !== null && (
            <FlatList
              data={images}
              horizontal
              pagingEnabled
              initialScrollIndex={previewIndex}
              getItemLayout={(_, index) => ({
                length: SCREEN_WIDTH,
                offset: SCREEN_WIDTH * index,
                index,
              })}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  activeOpacity={1} 
                  style={styles.fullImageWrapper}
                  onPress={() => setPreviewIndex(null)}
                >
                  <Image 
                    source={{ uri: item }} 
                    style={styles.fullImage} 
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              )}
              showsHorizontalScrollIndicator={false}
            />
          )}
        </View>
      </Modal>

      {/* 睡眠狀況選擇器 Modal */}
      <Modal
        visible={isSleepPickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSleepPickerVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setSleepPickerVisible(false)}
        >
          <View style={styles.pickerContainer}>
            <Text style={styles.modalTitle}>選擇睡眠狀況</Text>
            {SLEEP_OPTIONS.map((option) => (
              <TouchableOpacity 
                key={option}
                style={styles.pickerItem}
                onPress={() => {
                  setSleepStatus(option);
                  setSleepPickerVisible(false);
                }}
              >
                <Text style={[styles.pickerItemText, sleepStatus === option && styles.selectedPickerText]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backButton: { padding: 5 },
  title: { fontSize: 18, fontWeight: 'bold' },
  saveButton: { fontSize: 18, fontWeight: 'bold', color: '#007AFF' },
  form: { flex: 1, padding: 20 },
  section: { marginBottom: 25 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  label: { fontSize: 16, fontWeight: '700', color: '#333' },
  summaryBox: { flexDirection: 'row', backgroundColor: '#000', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 15, marginBottom: 10, justifyContent: 'space-around', width: '95%', alignSelf: 'center' },
  summaryItem: { alignItems: 'center' },
  summaryLabel: { color: '#AAA', fontSize: 11, marginBottom: 2 },
  summaryValue: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  successText: { color: '#81C784' },
  exceedText: { color: '#FF5252' },
  mealContainer: { marginTop: 15, padding: 10, backgroundColor: '#FFF', borderRadius: 8, borderWidth: 1, borderColor: '#EEE' },
  mealTitle: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 8 },
  subLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
  inputRow: { flexDirection: 'row', justifyContent: 'space-between' },
  inputCol: { flex: 1, marginRight: 10 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 10, fontSize: 16, minHeight: 45 },
  targetInput: { backgroundColor: '#F1F3F5', borderWidth: 1, borderColor: '#CED4DA', borderRadius: 8, padding: 8, fontSize: 16, textAlign: 'center', fontWeight: 'bold', color: '#495057' },
  textArea: { minHeight: 80, textAlignVertical: 'top', marginTop: 5 },
  optionRow: { flexDirection: 'row', marginBottom: 10 },
  optionButton: { flex: 1, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD', paddingVertical: 10, alignItems: 'center', marginRight: 8, borderRadius: 8 },
  optionButtonActive: { backgroundColor: '#000', borderColor: '#000' },
  optionText: { fontSize: 14, color: '#666', fontWeight: '600' },
  optionTextActive: { color: '#FFF' },
  sleepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dropdown: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginRight: 10, height: 45 },
  dropdownText: { fontSize: 15, color: '#333' },
  sleepInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD', borderRadius: 8, paddingHorizontal: 10, height: 45 },
  sleepInput: { flex: 1, fontSize: 16, textAlign: 'center', padding: 0 },
  unitText: { fontSize: 14, color: '#666', marginLeft: 4 },
  imageScroll: { flexDirection: 'row', marginTop: 10 },
  imageWrapper: { marginRight: 15, alignItems: 'center' },
  imageThumb: { width: 100, height: 100, borderRadius: 8, backgroundColor: '#EEE' },
  smallDeleteButton: { marginTop: 5, padding: 2 },
  addImageButton: { width: 100, height: 100, borderRadius: 8, borderWidth: 1, borderColor: '#DDD', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  addImageText: { fontSize: 12, color: '#AAA', marginTop: 5 },
  previewContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' },
  previewClose: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 10, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 25 },
  fullImageWrapper: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  pickerContainer: { width: '70%', backgroundColor: '#FFF', borderRadius: 12, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  pickerItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEE', alignItems: 'center' },
  pickerItemText: { fontSize: 16, color: '#333' },
  selectedPickerText: { color: '#007AFF', fontWeight: 'bold' },
});
