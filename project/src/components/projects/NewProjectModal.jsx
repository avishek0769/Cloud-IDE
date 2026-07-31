import React, { useCallback, useContext, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Context } from '../../context/ContextProvider';
import { useNavigate } from 'react-router-dom';

const LANGUAGES = ['JavaScript', 'C', 'C++'];
const LANG_VALUE = ['js', 'c', 'cpp'];

export function NewProjectModal({ isOpen, onClose, setLoading }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState(LANG_VALUE[0]);
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState("");
  const { domain } = useContext(Context)
  const navigate = useNavigate()

  const showAlertFunc = useCallback((mess) => {
    setShowAlert(true)
    setMessage(mess)
    setTimeout(() => {
      setShowAlert(false)
    }, 2000);
  }, [setShowAlert, setMessage])

  const handleCreateProject = ({ name, description, language }) => {
    fetch(`${domain}/projects/create`, {
      method: "POST",
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify({ name, description, language }),
      credentials: "include"
    })
    .then(res => {
      if (res.status > 399) {
        showAlertFunc("Unable to create new project");
        return
      }
      else return res.json()
    })
    .then(data => {
      if (data) {
        navigate(`/playground?containerId=${data.data.containerId}`)
      }
    })
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleCreateProject({ name, description, language });
    setName('');
    setDescription('');
    setLanguage(LANG_VALUE[0]);
    setLoading(true)
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project">
      <form onSubmit={handleSubmit} className="space-y-4 font-sans">
        <div>
          <label htmlFor="name" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            Project Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full h-10 px-3.5 bg-[#08080a] border border-gray-900 hover:border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="e.g. node-chat-app"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="block w-full px-3.5 py-2.5 bg-[#08080a] border border-gray-900 hover:border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
            placeholder="Describe what this workspace does..."
            required
          />
        </div>

        <div>
          <label htmlFor="language" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            Programming Language
          </label>
          <div className="relative">
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="block w-full h-10 px-3.5 bg-[#08080a] border border-gray-900 hover:border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none cursor-pointer"
            >
              {LANGUAGES.map((lang, index) => (
                <option key={lang} value={LANG_VALUE[index]} className="bg-[#0c0c0f] text-white">
                  {lang}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-900/60 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 text-xs font-semibold text-gray-400 hover:text-white hover:bg-gray-800/40 rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-9 px-4 text-xs font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all shadow-md shadow-blue-500/10"
          >
            Create Project
          </button>
        </div>
      </form>
    </Modal>
  );
}