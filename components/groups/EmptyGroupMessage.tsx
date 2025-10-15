import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useRouter } from 'expo-router';

const EmptyGroupsMessage = () => {

const router = useRouter()

  return (

    <View style ={{
        flex:1,
        // backgroundColor:"black",
        display:"flex",
        alignItems:"center",
        justifyContent:"center"
    }}>

    <View
     
      style={styles.container}
    >
      <View style={styles.content}>
        <MaterialCommunityIcons
        size={hp(20)}
              name="account-group-outline"
              color="#B2BEB5" style={styles.icon}
            />
                
        <Text style={styles.message}>
          Looks like you're floating solo in the social universe! 
          Join existing groups or blast off your own community rocket! 🚀
        </Text>

        <TouchableOpacity style={styles.button} onPress={()=> router.push("/(groups)/newGroup")}>
          <LinearGradient
            colors={['#a8edea', '#0077e4']}
            style={styles.gradientButton}
          >
            <Feather name="plus-circle" size={20} color="#fff" />
            <Text style={styles.buttonText}>Create Group</Text>
          </LinearGradient>
        </TouchableOpacity>

      </View>
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    margin: 20,
    padding: 2,

  },
  content: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    padding: 25,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 15,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  message: {
    fontSize: 16,
    color: '#B2BEB5',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  button: {
    width: '100%',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default EmptyGroupsMessage;