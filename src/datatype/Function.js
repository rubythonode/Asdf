/**
 * @project Asdf.js
 * @author N3735
 * @namespace F
 */
(function($_) {
	$_.F = {};
	var slice = Array.prototype.slice, fnProto = Function.prototype, nativeBind = fnProto.bind;
	
	/**
	 * @memberof F
	 * @param {*} value value
	 * @returns {*} value를 리턴한다. 
	 * @desc value를 리턴한다.
	 */
	function identity(value) {
		return value;
	}
	
	/**
	 * @memberof F
	 * @param {function} func 실행 함수
	 * @param {object} context 실행 함수 context
	 * @returns {function} context에서 실행할 함수를 반환한다.
	 * @desc 함수의 context를 변경한다.
	 * @example
	 * var obj = {name: 'kim'};
	 * window.name = 'lee';
	 * function getName(){return this.name};
	 * getName(); //return 'lee'
	 * Asdf.F.bind(getName, obj)(); // return 'kim'
	 */
	function bind(func, context) {
		if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
		if (!$_.O.isFunction(func)) throw new TypeError;
		if (arguments.length < 3 && $_.O.isUndefined(arguments[1])) return func;
		var __method = func, args = slice.call(arguments, 2);
		return function() {
			var a = [];
			$_.A.merge(a, args);
			$_.A.merge(a, arguments);
			return __method.apply(context, a);
		}
	}
		
	/**
	 * @memberof F
	 * @param {function} func 실행 함수
	 * @param {...*=} args 미리 넣을 인자들
	 * @returns {function} func에 미리 인자를 넣은 함수를 반환한다.
	 * @desc 앞부터 인자를 채워 넣는다.
	 * @example
	 * var inc1 = Asdf.F.curry(function(a,b){return a+b;}, 1);
	 * var inc2 = Asdf.F.curry(function(a,b){return a+b;}, 2);
	 * inc1(1); return 2;
	 * inc2(1); return 3; 
	 */
	function curry(func) {
		if (!$_.O.isFunction(func)) throw new TypeError;
		if (arguments.length == 1)
			return func;
		var __method = func, args = slice.call(arguments, 1);
		return function() {
			var a = [];
			$_.A.merge(a, args);
			$_.A.merge(a, arguments);
			return __method.apply(this, a);
		};
	}

	/**
	 * @memberof F
	 * @param {function} func 실행 함수
	 * @param {number} timeout 지연시간(초) 
	 * @returns {*} setTimeoutId를 반환한다.
	 * @desc 실행함수를 지연시간 후에 실행한다. 
	 */
	function delay(func, timeout) {
		if (!$_.O.isFunction(func)) throw new TypeError;
		var __method = func, args = slice.call(arguments, 2);
		timeout = timeout * 1000;
		return window.setTimeout(function() {
			return __method.apply(__method, args);
		}, timeout);
	}
	
	/**
	 * @memberof F
	 * @param {function} func 실행 함수
	 * @returns {*} setTimeoutId를 반환한다.
	 * @desc 실행함수를 0.01초 후에 실행한다. 
	 */
	function defer(func) {
		if (!$_.O.isFunction(func)) throw new TypeError;
		var args = $_.A.merge([ func, 0.01 ], slice.call(arguments, 1));
		return delay.apply(this, args);
	}

	/**
	 * @memberof F
	 * @param {function} func 실행 함수
	 * @param {function} wrapper wrapper 함수 
	 * @returns {function} 실행함수를 wrapper로 감싼 함수를 반환한다.
	 * @desc 실행함수를 wrapper로 감싼 함수를 반환한다. wrapper의 첫번째 인자는 실행 함수 이다.
	 * @example
	 * function fn(a){
	 * 	return -a;
	 * }
	 * Asdf.F.wrap(fn, function(fn, a){ return -fn(a);})(2); //return 2;
	 */
	function wrap(func, wrapper) {
		if (!$_.O.isFunction(func)) throw new TypeError;
		var __method = func;
		return function() {
			var a = $_.A.merge([ bind(__method, this) ], arguments);
			return wrapper.apply(this, a);
		};
	}
	
	/**
	 * @memberof F
	 * @param {function} func 실행 함수
	 * @param {function} pre 이전 실행 함수
	 * @param {boolean} stop 이전 실행 함수의 결과값여부에 따라 실행 함수를 실행여부를 결정 
	 * @returns {function} 이전 실행 함수, 실행 함수를 실행하는 함수를 반환한다.
	 * @desc 이전 실행 함수, 실행 함수를 실행하는 함수를 반환한다.
	 * @example
	 * function b(a){
	 * 	return !a; 
	 * }
	 * function fn(a){
	 * 	return a;
	 * }
	 * Asdf.F.before(fn, b)(true); //return true;
	 */
	function before(func, pre, stop){
		if(!$_.O.isFunction(func)|| !$_.O.isFunction(pre)) throw new TypeError;
		return function () {
			var pres;
			if(!(pres = pre.apply(this,arguments))&&stop) return pres;
			return func.apply(this,arguments);
		};
	}
	
	/**
	 * @memberof F
	 * @param {function} func 실행 함수
	 * @param {function} after 이후 실행 함수
	 * @param {boolean} stop 실행 함수의 결과값여부에 따라 이후 실행 함수를 실행여부를 결정 
	 * @returns {function} 실행 함수, 이후 실행함수를 실행하는 함수를 반환한다.
	 * @desc 실행 함수, 이후 실행함수를 실행하는 함수를 반환한다.
	 * @example
	 * function a(res, a) {
	 * 	return res * 2;
	 * }
	 * function fn(a){
	 * 	return a * a;
	 * }
	 * Asdf.F.after(fn, a)(2); //return 8;
	 */
	function after(func, after, stop){
		if(!$_.O.isFunction(func)||!$_.O.isFunction(after)) throw new TypeError;
		return function() {
			var res = func.apply(this, arguments);
			if(!res && stop) return res;
			return after.apply(this, $_.A.merge([res], arguments));
		};
	}
	
	/**
	 * @memberof F
	 * @param {function} func 실행 함수
	 * @returns {function} 실행 함수 첫번째 인자를 this로 넣은 함수를 반환한다.
	 * @desc 순수 함수를 특정 객체의 매소드로 만들 경우 유용한 함수이다. 이 함수를 실행하면 첫번째 인자에 this를 넣은 함수를 반환한다.
	 * @example
	 * var obj = {name: 'lee'};
	 * function getName(obj){
	 * 	return obj.name;
	 * }
	 * obj.getName = Asdf.F.methodize(getName);
	 * obj.getName(); //return 'lee'
	 */
	function methodize(func) {
		if (func._methodized)
			return func._methodized;
		var __method = func;
		return func._methodized = function() {
			var a = $_.A.merge([ this ], slice.call(arguments,0));
			return __method.apply(null, a);
		}
	}
	
	/**
	 * @memberof F
	 * @param {...function} fns 실행 함수들
	 * @returns {function} 함수들 오른쪽에서 왼쪽으로 실행하는 함수를 반환한다.
	 * @desc 함수들 오른쪽에서 왼쪽으로 실행하는 함수를 반환한다. composeRight(f, g) -> g(f(x))
	 * @example
	 * function fn(a){
	 * 	return a*2;
	 * }
	 * function fn2(a){
	 * 	return a+2;
	 * }
	 * 
	 * Asdf.F.composeRight(fn, fn2)(2); // return 8;
	 */
	function composeRight() {
		var fns = $_.A.filter(slice.call(arguments), $_.O.isFunction);
		var fn = $_.A.reduce(fns, $_.Core.behavior.compose);
		return function () {
			return fn.apply(this, arguments);
		};
	}
	
	/**
	 * @memberof F
	 * @param {...function} fns 실행 함수들
	 * @returns {function} 함수들 오른쪽에서 왼쪽으로 실행하는 함수를 반환한다.
	 * @desc 함수들 오른쪽에서 왼쪽으로 실행하는 함수를 반환한다. compose(f, g) -> f(g(x))
	 * @example
	 * function fn(a){
	 * 	return a*2;
	 * }
	 * function fn2(a){
	 * 	return a+2;
	 * }
	 * 
	 * Asdf.F.compose(fn, fn2)(2); // return 6;
	 */
	function compose() {
		var fns = $_.A.filter(slice.call(arguments), $_.O.isFunction);
		var fn = $_.A.reduceRight(fns, $_.Core.behavior.compose);
		return function () {
			return fn.apply(this, arguments);
		};
	}
	var exisFunction = function (fn) {
		if($_.O.isNotFunction(fn)){
			throw new TypeError();
		}
		return true;
	};
	
	/**
	 * @memberof F
	 * @function
	 * @param {function} func 실행 함수
	 * @param {number} number 제거할 인자 갯수.
	 * @returns {function} 실행 함수에서 number 갯수 인자를 제거한 실행 함수를 반환한다.
	 * @desc 실행 함수에서 number 갯수 인자를 제거한 실행 함수를 반환한다.
	 * @example
	 * function add(a,b){ return a+b; }
	 * var add2 = Asdf.F.extract(fn, 2);
	 * add2(1,2,3,4); // return 7;
	 */
	var extract = before($_.Core.combine.extract, exisFunction);
	
	/**
	 * @memberof F
	 * @function
	 * @param {function} func 실행 함수
	 * @param {...*=} args 미리 넣을 인자들
	 * @returns {function} func에 미리 인자를 넣은 함수를 반환한다.
	 * @desc 특정 위치 부터 미리 인자를 넣은 함수를 반환한다.
	 * @example
	 * var half = Asdf.F.partial(function(a,b){return a/b;}, undefined, 2);
	 * var quater = Asdf.F.partial(function(a,b){return a/b;}, 4);
	 * half(100); // return 50;
	 * quater(100); // return 25;
	 */ 
	var partial = before($_.Core.combine.partial, exisFunction);
	
	/**
	 * @memberof F
	 * @function
	 * @param {...function} fns 실행 함수들
	 * @returns {function} 함수 실행 결과 값 중 하나만 참이면 결과는 참인 함수를 반환한다.
	 * @desc 함수 실행 중에 하나만 참이면 이후 연산은 하지 않고 참인 함수를 반환한다.
	 * @example
	 * Asdf.F.or(Asdf.O.isString, Asdf.O.isFunction, Asdf.O.isArray)('string'); // return true;
	 */
	function or(){
		var fns = $_.A.filter(slice.call(arguments), $_.O.isFunction);
		return function(){
			var i;
			for(i =0;i < fns.length; i++){
				if(fns[i].apply(this, arguments))
					return true;
			}
			return false;
		};
	}
	
	/**
	 * @memberof F
	 * @function
	 * @param {...function} fns 실행 함수들
	 * @returns {function} 함수 실행 결과 값 중 하나만 거짓이면 결과는 거짓인 함수를 반환한다.
	 * @desc 함수 실행 중에 하나만 거짓이면 이후 연산은 하지 않고 거짓인 함수를 반환한다.
	 * @example
	 * function fn(a){
	 * 	return a < 10;
	 * }
	 * function fn1(a){
	 * 	return a < 15;
	 * }
	 * function fn2(a){
	 * 	return a < 20;
	 * }
	 * Asdf.F.and(fn, fn1, fn2)(9); // return true;
	 */
	function and(){
		var fns = $_.A.filter(slice.call(arguments), $_.O.isFunction);
		return function(){
			var i;
			for(i =0;i < fns.length; i++){
				if(!fns[i].apply(this, arguments))
					return false;
			}
			return true;
		};
	}
	var then = partial(after, undefined, undefined, true);
	
	function orElse(func, elseFn, stop){
		if(!$_.O.isFunction(func)||!$_.O.isFunction(elseFn)) throw new TypeError;
		return function() {
			var res = func.apply(this, arguments);
            if(Asdf.O.isNotUndefined(stop)&&stop===res||Asdf.O.isUndefined(stop)&&!res)
                return elseFn.apply(this, arguments);
            return res;


		};
	}
    function guarded(guards){
        if(!Asdf.O.isArray(guards)) throw new TypeError();
        var guardType = {
            test: function(v){return Asdf.O.isFunction(v)},
            fn: function(v){return Asdf.O.isFunction(v)}
        }
        if(!Asdf.A.any(guards, partial(Asdf.O.type, undefined, guardType)))
            throw new TypeError();
        return function(){
            for(var i =0 ; i < guards.length; i++){
                if(guards[i].test.apply(guards[i].context, arguments))
                    return guards[i].fn.apply(guards[i].context, arguments);
            }
            throw new TypeError();
        }
    }
    function sequence() {
        var fns = $_.A.filter(slice.call(arguments), $_.O.isFunction);
        return function(){
            var res = undefined;
            Asdf.A.each(fns, function(f){
                res = f.apply(this, arguments);
            });
            return res;
        }
    }
    function cases(obj, defaults){
        if(!Asdf.O.isPlainObject(obj) || !Asdf.O.isFunction(defaults)) throw new TypeError();
        defaults = defaults || function(){};
        return function(key){
            var arg = slice.call(arguments, 1);
            var fn;
            if(fn = get(obj, key)){
                if(Asdf.O.isFunction(fn)){
                    return fn.apply(this, arg);
                }
                return fn;
            }else {
                return defaults.apply(this, arg);
            }
        }
    }
    var stop = {};
    function overload(fn, typeFn, overloadedFn){
        overloadedFn = overloadedFn||function(){throw new TypeError;};
        var f = function(){
            if(!typeFn.apply(this, arguments)){
                return stop;
            }
            return fn.apply(this, arguments);
        }
        return orElse(f, overloadedFn, stop)
    }
	$_.O.extend($_.F, {
		identity: identity,
		bind: bind,
		curry: curry,
		delay: delay,
		defer: defer,
		wrap: wrap,
		before: before,
		after:after,
		methodize: methodize,
		compose:compose,
		composeRight:composeRight,
		extract:extract,
		partial: partial,
		or: or,
		and: and,
		then: then,
		orElse: orElse,
        guarded: guarded,
        sequence: sequence,
        cases:cases,
        overload:overload
	}, true);

})(Asdf);