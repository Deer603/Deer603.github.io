# 第三方组件说明

XWCRecognizer包含以下第三方代码和模型。分发本目录时，请一并保留vendor目录中的许可文件以及本说明。

## @vladmandic/face-api

- 版本：1.7.15。
- 项目：[vladmandic/face-api](https://github.com/vladmandic/face-api)。
- 本地文件：vendor/face-api.js。
- 许可：MIT，Copyright (c) Vladimir Mandic。
- 完整许可：[vendor/face-api-LICENSE.txt](vendor/face-api-LICENSE.txt)。

该项目从face-api.js发展而来，浏览器构建包含TensorFlow.js。上游仓库于2025年2月5日归档，目前为只读状态。

## OpenCV Zoo SFace

- 模型：face_recognition_sface_2021dec.onnx，MobileFaceNet网络，采用SFace损失训练。
- 来源：[OpenCV Zoo SFace](https://github.com/opencv/opencv_zoo/tree/main/models/face_recognition_sface)。
- 本地文件：models/face_recognition_sface_2021dec.onnx。
- 上游目录声明Apache-2.0许可，保留全文：[vendor/SFace-LICENSE.txt](vendor/SFace-LICENSE.txt)。模型文件未修改。
- 112×112输入、RGB排列和5点对齐目标参考[OpenCV FaceRecognizerSF实现](https://github.com/opencv/opencv/blob/4.x/modules/objdetect/src/face_recognize.cpp)。本项目使用独立实现的二维相似变换求解。

## ONNX Runtime Web

- 版本：1.30.0。
- 来源：[microsoft/onnxruntime](https://github.com/microsoft/onnxruntime)，npm包onnxruntime-web。
- 用途：SFace模型的浏览器WebAssembly推理。
- 本地文件：vendor/ort/中的JavaScript、ES模块与WebAssembly文件。
- 许可：MIT，保留[LICENSE.txt](vendor/ort/LICENSE.txt)及[ThirdPartyNotices.txt](vendor/ort/ThirdPartyNotices.txt)。

## 原face-api.js

- 项目：[justadudewhohacks/face-api.js](https://github.com/justadudewhohacks/face-api.js)。
- 许可：MIT，Copyright (c) 2018 Vincent Mühler。
- 完整许可：[vendor/face-api-original-LICENSE.txt](vendor/face-api-original-LICENSE.txt)。

保留原项目许可，以体现face-api派生代码的来源与版权声明。

## TensorFlow.js

- 项目：[tensorflow/tfjs](https://github.com/tensorflow/tfjs)。
- 用途：随face-api浏览器构建打包的张量运算与模型推理运行时。
- 许可：Apache-2.0。
- 官方许可：[tensorflow/tfjs/LICENSE](https://github.com/tensorflow/tfjs/blob/master/LICENSE)。

Apache-2.0许可全文附于本说明末尾。

## 人脸模型

下列三个模型是网页实际加载的模型，文件随@vladmandic/face-api的model目录提供，模型说明与来源见[上游TUTORIAL](https://github.com/vladmandic/face-api/blob/master/TUTORIAL.md)。

|模型|本地文件|
|---|---|
|SSD Mobilenet V1人脸检测|models/ssd_mobilenetv1_model-weights_manifest.json与models/ssd_mobilenetv1_model.bin|
|68点人脸关键点|models/face_landmark_68_model-weights_manifest.json与models/face_landmark_68_model.bin|
|128维人脸识别|models/face_recognition_model-weights_manifest.json与models/face_recognition_model.bin|

SSD Mobilenet V1人脸检测权重由[yeephycho/tensorflow-face-detection](https://github.com/yeephycho/tensorflow-face-detection)提供，经过face-api项目转换并分发。68点神经网络关键点模型由原face-api.js作者训练，在上述MIT项目中分发。此处采用的是face_landmark_68_model.bin，并非dlib的shape_predictor_68_face_landmarks.dat。

人脸识别权重来自Davis King训练的dlib识别网络，输出128维人脸特征。其原始模型仓库[davisking/dlib-models](https://github.com/davisking/dlib-models)将这些模型声明为公有领域，并提供[CC0-1.0许可](https://github.com/davisking/dlib-models/blob/master/LICENSE)。本目录保留face-api仓库分发时的模型文件及其来源说明。

预设人物的初始参考资料来自提供的手机相册搜索截图，姓名沿用资料中的来源标签；后续批次沿用用户提供的逐图标签与姓名文件夹。SFace参考库复用当前13人、76张参考图的标签，未自行重新分配人物姓名。参考图用于提取特征，不是从头训练上述模型；人物照片与特征也不因此取得第三方代码的开源许可。具体批次见README与presets/source.json。

本说明记录所用组件的许可和上游来源，不将依赖库的MIT许可扩展为XWCRecognizer自身的项目许可。

## TensorFlow.js许可全文

```text

                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "[]"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Copyright [yyyy] [name of copyright owner]

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

```
