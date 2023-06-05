import { StatusBar } from "expo-status-bar";
import { ImageBackground, Text, View, TouchableOpacity } from "react-native";
import {
  useFonts,
  Roboto_400Regular,
  Roboto_700Bold,
} from "@expo-google-fonts/roboto";

import { BaiJamjuree_700Bold } from "@expo-google-fonts/bai-jamjuree";

import blurBg from "../src/assets/bg-blur.png";
import Stripes from "../src/assets/stripes.svg";
import NLWLogo from "../src/assets/nlw-spacetime-logo.svg";
import { styled } from "nativewind";
import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import { useEffect } from "react";
import { api } from "../src/lib/api";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

//Permite usar tailwind no Stripes
const StyledStripes = styled(Stripes);

const discovery = {
  authorizationEndpoint: "https://github.com/login/oauth/authorize",
  tokenEndpoint: "https://github.com/login/oauth/access_token",
  revocationEndpoint:
    "https://github.com/settings/connections/applications/673297a5a40c82d14387",
};

export default function App() {
  const router = useRouter();

  const [hasLoadedFonts] = useFonts({
    Roboto_400Regular,
    Roboto_700Bold,
    BaiJamjuree_700Bold,
  });

  const [request, response, signInWithGitHub] = useAuthRequest(
    {
      clientId: "673297a5a40c82d14387",
      scopes: ["identity"],
      redirectUri: makeRedirectUri({
        scheme: "nlwspacetime",
      }),
    },
    discovery
  );

  async function handleGitHuhOAuthCode(code: string) {
    const response = await api.post("/register", {
      code,
    });

    const { token } = response.data;
    await SecureStore.setItemAsync("token", token);
    router.push("/memories");
    console.log(token);
  }

  //Toda a vez que a variável response mudar seu valor, executa o código
  //O código verifica o tipo de response é sucess então obtenho o código do github
  useEffect(() => {
    //console.log(
    //makeRedirectUri({
    //scheme: "nlwspacetime",
    // })
    //  );

    if (response?.type === "success") {
      const { code } = response.params;
      handleGitHuhOAuthCode(code);
    }
  }, [response]);

  if (!hasLoadedFonts) {
    return null;
  }

  return (
    <ImageBackground
      source={blurBg}
      className="bg-gray-900 px-8 py-10 relative flex-1 items-center"
      imageStyle={{ position: "absolute", left: "-100%" }}
    >
      <StyledStripes className="absolute left-2" />
      <View className="flex-1 items-center justify-center gap-6">
        <NLWLogo />

        <View className="space-y-2">
          <Text className="text-center font-title text-2xl leading-tight text-gray-50">
            Sua cápsula do tempo{" "}
          </Text>
          <Text className="text-center font-body text-base leading-relaxed text-gray-100">
            Colecione momentos marcantes da sua jornada e compartilhe (se
            quiser) com o mundo!{" "}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          className="rounded-full bg-green-500 px-5 py-2"
          onPress={() => signInWithGitHub()}
        >
          <Text className="font-alt text-sm uppercase text-black">
            Cadastrar Lembrança
          </Text>
        </TouchableOpacity>
      </View>

      <Text className="text-center font-body text-sm leading-relaxed text-gray-200">
        {" "}
        Feito por Carol Andrade no NLW da Rocketseat 💜
      </Text>
      <StatusBar style="light" translucent />
    </ImageBackground>
  );
}
