import { Button, Form, Input } from 'antd';
import { Link } from 'react-router-dom';

interface FormValues {
  email: string;
  password: string;
}

type FieldData = {
  name: (string | number)[];
  value?: any;
  touched?: boolean;
  validating?: boolean;
  errors?: any[];
};

function LoginPage() {
  const initialValue: FormValues = {
    email: '',
    password: '',
  };

  const onFiledsChange = (field: FieldData[], allFields: FieldData[]) => {
    console.log(field[0].value);
  };
  // 7. 확인 버튼 클릭시 최종 입력값
  const onFinish = (values: FormValues) => {
    console.log(values);
  };

  return (
    <div>
      {/* 박스 */}
      <div className="mt-[140px] mb-[100px]">
        <div className="border border-gray-300 rounded-[5px] bg-white w-[1326px] h-[737px] shadow-card mx-auto flex">
          {/* 왼쪽 */}
          <div className="w-[50%] y-full">
            <div className="my-[150px]">
              <img className="mx-auto mb-[42px] " src="./loginimage.svg" alt="로그인" />
              <div className="flex justify-center items-center">
                <img src="/images/footerLogo.svg" alt="Mo:ri" />
                <div className="ml-6">
                  <p className="text-sm font-bold text-gray-600">
                    다양한 관심사를 바탕으로 한 자기계발 모임 플랫폼.
                  </p>
                  <p className="text-sm font-bold text-gray-600">
                    참여와 기록을 통해 성장과 커리어를 이어갑니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* 오른쪽 */}
          <div className="w-[50%] y-full py-[70px] px-[107px]">
            <div>
              {/* 로고 */}
              <div className="flex justify-center items-center mb-12">
                <img className="w-[110px] h-[35px]" src="/images/mori_logo.svg" alt="Mo:ri" />
                <div className="text-lg ml-5">
                  <p>mo:ri 에 오신 걸 환영합니다.</p>
                  <p className="font-bold">로그인 후 더 많은 모임을 만나보세요!</p>
                </div>
              </div>
              {/* 입력창 */}
              <div className="mb-5">
                <div>
                  <Form
                    layout="vertical"
                    initialValues={initialValue}
                    onFieldsChange={(field, allFields) => onFiledsChange(field, allFields)}
                    onFinish={values => onFinish(values)}
                  >
                    <div className="mb-[50px]">
                      <Form.Item
                        label={<p className="font-bold text-gray-600">이메일 (아이디)</p>}
                        name={'email'}
                        required={false}
                        rules={[
                          { required: true, message: '아이디를 입력해 주세요.' },
                          { type: 'email', message: '아이디 형식에 맞지 않습니다.' },
                        ]}
                        colon={false}
                      >
                        <Input
                          className="w-[450px] border-t-0 border-l-0 border-r-0 rounded-none border-[#A3A3A3] focus:shadow-none "
                          placeholder="아이디를 입력해 주세요."
                        />
                      </Form.Item>
                      <Form.Item
                        label={<p className="font-bold text-gray-600">비밀번호</p>}
                        name={'password'}
                        required={false}
                        rules={[
                          { required: true, message: '비밀번호를 입력해 주세요.' },
                          {
                            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,16}$/,
                            message: '비밀번호는 8~16자 이며, 대소문자, 숫자를 포함해야 합니다.',
                          },
                        ]}
                        colon={false}
                      >
                        <Input.Password
                          className="w-[450px] border-t-0 border-l-0 border-r-0 rounded-none border-[#A3A3A3] !focus:shadow-none "
                          placeholder="비밀번호를 입력하세요."
                        />
                      </Form.Item>
                    </div>
                    <Form.Item className="mx-auto">
                      <Button
                        htmlType="submit"
                        className="w-[450px] h-[48px] bg-brand text-white text-xl font-bold rounded-[5px]"
                      >
                        로그인
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
                <div className="flex gap-5 text-sm text-gray-600 justify-end">
                  <Link className="text-gray-600" to={'/findid'}>
                    아이디 찾기
                  </Link>
                  <span>|</span>
                  <Link className="text-gray-600" to={'/findpw'}>
                    비밀번호 찾기
                  </Link>
                </div>
              </div>
              {/* 다른경로회원가입 */}
              <div>
                <div className="w-[450px] border-b border-gray-[#acacac] py-3 text-gray-600 font-bold">
                  <p>다른 경로 회원가입</p>
                </div>
                <div className="flex justify-center items-center py-7 gap-12">
                  <Link to={'/'} className="flex">
                    <img className="mr-3 h-[27px]" src="./kakao.svg" alt="카카오로그인" />
                    <p className=" text-gray-600 font-bold">카카오 로그인</p>
                  </Link>
                  <Link to={'/'} className="flex">
                    <img className="mr-3 h-[27px]" src="./google.svg" alt="구글로그인" />
                    <p className=" text-gray-600 font-bold">구글 로그인</p>
                  </Link>
                </div>
              </div>
              {/* 회원가입 */}
              <div className="text-center py-5">
                <Link to={'/signup'}>
                  <p className=" text-gray-600">
                    아직 회원이 아니신가요?{' '}
                    <span className="text-brand font-bold">회원가입하기</span>
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
